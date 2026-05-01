import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, updateDoc, increment, getDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useStore } from '../store/useStore';
import { QRScanner } from '../components/QRScanner/Scanner';
import { 
  Scan, 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  Banknote, 
  Smartphone,
  ChevronRight,
  X,
  User,
  Phone,
  Keyboard,
  IndianRupee,
  CheckCircle2,
  Printer
} from 'lucide-react';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

export function Billing() {
  const { cart, addToCart, removeFromCart, updateCartQuantity, clearCart, user, profile } = useStore();
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isManualAddOpen, setIsManualAddOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);
  
  // Customer Info
  const [customerInfo, setCustomerInfo] = useState({
    customerNumberStr: '',
    name: '',
    phone: '',
    email: ''
  });
  const [customerSearchResults, setCustomerSearchResults] = useState<any[]>([]);

  // Payment Details
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const globalTaxRate = profile?.taxPercentage || 0;

  // Manual Product State
  const [modalSearchTerm, setModalSearchTerm] = useState('');
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [modalSearchResults, setModalSearchResults] = useState<any[]>([]);
  const [manualProduct, setManualProduct] = useState({
    id: '',
    name: '',
    price: 0,
    quantity: 1
  });

  const subtotal = cart.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 0), 0);
  const tax = subtotal * (globalTaxRate / 100);
  const total = subtotal + tax;
  const pendingAmount = Math.max(0, total - amountPaid);

  useEffect(() => {
    setAmountPaid(total);
  }, [total]);

  useEffect(() => {
    if (searchTerm.length > 1) {
      const searchProducts = async () => {
        const q = query(
          collection(db, 'products'),
          where('name', '>=', searchTerm),
          where('name', '<=', searchTerm + '\uf8ff')
        );
        const snapshot = await getDocs(q);
        setSearchResults(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      };
      searchProducts();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const handleScan = async (productId: string) => {
    try {
      const productDoc = await getDoc(doc(db, 'products', productId));
      if (productDoc.exists()) {
        addToCart({ id: productDoc.id, ...productDoc.data() });
        setIsScannerOpen(false);
      } else {
        toast.error('Product not found');
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (customerInfo.name.length > 1) {
      const searchCustomers = async () => {
        const q = query(
          collection(db, 'customers'),
          where('name', '>=', customerInfo.name),
          where('name', '<=', customerInfo.name + '\uf8ff')
        );
        const snapshot = await getDocs(q);
        setCustomerSearchResults(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      };
      searchCustomers();
    } else if (customerInfo.customerNumberStr && customerInfo.customerNumberStr.length > 0) {
      const searchCustomersByNum = async () => {
        const num = parseInt(customerInfo.customerNumberStr);
        if (isNaN(num)) return;
        const q = query(
          collection(db, 'customers'),
          where('customerNumber', '==', num)
        );
        const snapshot = await getDocs(q);
        setCustomerSearchResults(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      };
      searchCustomersByNum();
    } else {
      setCustomerSearchResults([]);
    }
  }, [customerInfo.name, customerInfo.customerNumberStr]);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    // Mandatory Customer Name Check
    if (!customerInfo.name || customerInfo.name.trim() === '') {
      toast.error('Please enter a customer name to proceed.');
      return;
    }

    setIsProcessing(true);
    try {
      // Create sale record
      const saleRef = await addDoc(collection(db, 'sales'), {
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        subtotal,
        tax,
        total,
        taxPercentage: globalTaxRate,
        amountPaid,
        pendingAmount,
        paymentMethod,
        customerInfo,
        staffId: user?.uid,
        createdAt: serverTimestamp()
      });

      // Update stock for existing products
      for (const item of cart) {
        if (item.id && !item.id.startsWith('manual-')) {
          await updateDoc(doc(db, 'products', item.id), {
            stock: increment(-item.quantity)
          });
        }
      }

      // Update customer record or create new one
      if (customerInfo.name) {
        const customersRef = collection(db, 'customers');
        let q = query(customersRef, where('phone', '==', customerInfo.phone));
        if (!customerInfo.phone) {
          q = query(customersRef, where('name', '==', customerInfo.name));
        }
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const customerDoc = querySnapshot.docs[0];
          await updateDoc(doc(db, 'customers', customerDoc.id), {
            name: customerInfo.name,
            email: customerInfo.email,
            phone: customerInfo.phone,
            pendingPayment: increment(pendingAmount),
            totalSpent: increment(total)
          });
        } else {
          // Create new customer
          const counterQuery = query(collection(db, 'customers'), orderBy('customerNumber', 'desc'), limit(1));
          const snapshot = await getDocs(counterQuery);
          const nextNumber = snapshot.empty ? 1 : (snapshot.docs[0].data().customerNumber || 0) + 1;

          await addDoc(collection(db, 'customers'), {
            name: customerInfo.name,
            email: customerInfo.email,
            phone: customerInfo.phone,
            customerNumber: nextNumber,
            pendingPayment: pendingAmount,
            totalSpent: total,
            loyaltyPoints: 0,
            createdAt: serverTimestamp()
          });
        }
      }

      setLastSale({
        id: saleRef.id,
        items: cart,
        total,
        pendingAmount,
        paymentMethod,
        customerInfo,
        date: new Date()
      });
      clearCart();
      setShowSuccess(true);
      setCustomerInfo({ name: '', phone: '', email: '', customerNumberStr: '' });
      setAmountPaid(0);
      toast.success('Transaction completed successfully');
    } catch (err) {
      console.error(err);
      toast.error('Checkout failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const generateInvoice = (invoiceId: string) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Invoice', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Invoice ID: ${invoiceId}`, 105, 30, { align: 'center' });
    doc.text(`Date: ${new Date().toLocaleString()}`, 105, 35, { align: 'center' });

    if (customerInfo.name) {
      doc.text(`Customer: ${customerInfo.name} (${customerInfo.phone})`, 105, 40, { align: 'center' });
    }

    // Table
    const tableData = cart.map(item => [
      item.name,
      item.quantity,
      `₹${item.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `₹${(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    ]);

    autoTable(doc, {
      startY: 50,
      head: [['Item', 'Qty', 'Price', 'Total']],
      body: tableData,
      foot: [
        ['', '', 'Subtotal', `₹${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
        ['', '', `Tax (${globalTaxRate}%)`, `₹${tax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
        ['', '', 'Total', `₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
        ['', '', 'Paid', `₹${amountPaid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
        ['', '', 'Balance', `₹${pendingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`]
      ]
    });

    doc.save(`invoice-${invoiceId}.pdf`);
  };

  const printInvoice = (sale: any) => {
    // Use a hidden iframe instead of window.open (more reliable for thermal)
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      alert('Cannot open print window. Please check popup blockers.');
      return;
    }

    const receiptHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Receipt - ${sale.id}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { background: white; font-family: 'Courier New', Courier, monospace; font-size: 40px; font-weight: bold; line-height: 1.4; color: #000; }
    @page { size: auto; margin: 10mm; }
    body { margin: 0; padding: 0; }
    .receipt { width: 100%; margin: 0 auto; background: white; page-break-inside: avoid; break-inside: avoid; }
    .header { text-align: center; margin-bottom: 0.8em; }
    .store-name { font-size: 1.5em; font-weight: bold; margin-bottom: 0.2em; }
    .divider { border-top: 0.1em dashed #000; margin: 0.5em 0; }
    .info { margin-bottom: 0.5em; font-size: 1em; }
    .flex-row { display: flex; justify-content: space-between; width: 100%; margin-bottom: 0.2em; }
    table { width: 100%; border-collapse: collapse; margin-top: 0.5em; margin-bottom: 0.5em; }
    th, td { text-align: left; padding: 0.2em 0; font-size: 1em; vertical-align: top; }
    th { border-bottom: 0.1em dashed #000; padding-bottom: 0.2em; }
    .col-name { width: 55%; padding-right: 0.2em; word-break: break-word; font-size: 1.1em; }
    .col-qty { width: 15%; text-align: center; }
    .col-price { width: 30%; text-align: right; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .total-section { margin-top: 0.5em; font-weight: bold; font-size: 1.2em; }
    .footer { text-align: center; margin-top: 1em; font-size: 0.9em; }
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <div class="store-name">லோகேஷ் விவசாயி</div>
      <div>Receipt</div>
    </div>
    <div class="info">
      <div class="flex-row">
        <div>${format(sale.date, 'dd/MM/yyyy')}</div>
        <div>${format(sale.date, 'HH:mm')}</div>
      </div>
      ${(sale.customerInfo?.name || sale.customerInfo?.phone) ? `
        <div class="flex-row">
          <div>${sale.customerInfo.name || ''}</div>
          <div>${sale.customerInfo.phone || ''}</div>
        </div>
      ` : ''}
      <div class="flex-row">
        <div>Bill: #${sale.id.slice(0, 8).toUpperCase()}</div>
        <div>Pay: ${sale.paymentMethod.toUpperCase()}</div>
      </div>
    </div>
    <div class="divider"></div>
    <table>
      <thead>
        <tr>
          <th class="col-name">Item</th>
          <th class="col-qty">Qty</th>
          <th class="col-price">Price</th>
        </tr>
      </thead>
      <tbody>
        ${sale.items.map((item: any) => `
          <tr>
            <td class="col-name">${item.name}</td>
            <td class="col-qty">${item.quantity}</td>
            <td class="col-price">${(item.price * item.quantity).toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div class="divider"></div>
    <table class="total-section">
      <tr><td>Total</td><td class="text-right">INR ${sale.total.toFixed(2)}</td></tr>
      ${sale.pendingAmount > 0 ? `
        <tr><td>Paid</td><td class="text-right">INR ${(sale.total - sale.pendingAmount).toFixed(2)}</td></tr>
        <tr><td>Pending</td><td class="text-right">INR ${sale.pendingAmount.toFixed(2)}</td></tr>
      ` : ''}
    </table>
    <div class="divider"></div>
    <div class="footer">
      <div>நன்றி மீண்டும் வருக!</div>
    </div>
  </div>
</body>
</html>
`;

    doc.open();
    doc.write(receiptHtml);
    doc.close();

    // Give it time to render, then print
    setTimeout(() => {
      iframe.contentWindow?.print();
    }, 300);
  };

  useEffect(() => {
    if (isManualAddOpen) {
      const fetchAllProducts = async () => {
        const q = query(collection(db, 'products'), orderBy('name', 'asc'));
        const snapshot = await getDocs(q);
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllProducts(products);
        setModalSearchResults(products);
      };
      fetchAllProducts();
    }
  }, [isManualAddOpen]);

  useEffect(() => {
    if (modalSearchTerm.trim() === '') {
      setModalSearchResults(allProducts);
    } else {
      const filtered = allProducts.filter(p => 
        p.name.toLowerCase().includes(modalSearchTerm.toLowerCase())
      );
      setModalSearchResults(filtered);
    }
  }, [modalSearchTerm, allProducts]);

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualProduct.id) {
      alert('Please select a product first');
      return;
    }
    addToCart({
      id: manualProduct.id,
      name: manualProduct.name,
      price: manualProduct.price,
      quantity: manualProduct.quantity
    });
    setIsManualAddOpen(false);
    setManualProduct({ id: '', name: '', price: 0, quantity: 1 });
    setModalSearchTerm('');
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] lg:flex-row gap-6 animate-in fade-in duration-500 pb-12">
      
      {/* Left Column - Main POS */}
      <div className="flex flex-col flex-1 gap-6 min-h-0">
        <header>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Billing Point</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Add items to cart and process transactions</p>
        </header>

        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#18181b] text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white shadow-sm"
            />
            
            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 z-40 max-h-[300px] overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#18181b] shadow-xl p-2 custom-scrollbar">
                {searchResults.map((p) => (
                  <button
                    key={p.id}
                    disabled={p.stock <= 0}
                    onClick={() => {
                      addToCart(p);
                      setSearchTerm('');
                      setSearchResults([]);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between p-3 rounded-lg transition-colors text-left",
                      p.stock <= 0 ? "opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-800/50" : "hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{p.name}</span>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className="text-xs text-slate-500">{p.category}</span>
                        {p.stock <= 0 && <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">Out of stock</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">₹{p.price.toFixed(2)}</span>
                      <div className="text-xs text-slate-500 mt-0.5">Stock: {p.stock}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={() => setIsManualAddOpen(true)}
              className="flex-1 sm:flex-none h-12 px-4 flex items-center justify-center space-x-2 rounded-xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm text-sm font-semibold whitespace-nowrap"
            >
              <Keyboard className="h-4 w-4" />
              <span>Manual Entry</span>
            </button>
            <button
              onClick={() => setIsScannerOpen(true)}
              className="flex-1 sm:flex-none h-12 px-4 flex items-center justify-center space-x-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm text-sm font-semibold whitespace-nowrap"
            >
              <Scan className="h-4 w-4" />
              <span>Scan Item</span>
            </button>
          </div>
        </div>

        {/* Cart Listing */}
        <div className="flex-1 bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200/60 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col min-h-[300px]">
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 space-y-4 p-8 text-center">
                <ShoppingCart className="w-16 h-16 opacity-50" />
                <p className="text-sm font-medium">Cart is empty. Scan items or search to add them.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50/80 dark:bg-slate-800/50 sticky top-0 border-b border-slate-200 dark:border-slate-800 z-10">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-slate-500 uppercase text-xs tracking-wider">Item</th>
                    <th className="px-6 py-3 font-semibold text-slate-500 uppercase text-xs tracking-wider text-right">Price</th>
                    <th className="px-6 py-3 font-semibold text-slate-500 uppercase text-xs tracking-wider text-center">Quantity</th>
                    <th className="px-6 py-3 font-semibold text-slate-500 uppercase text-xs tracking-wider text-right">Total</th>
                    <th className="px-6 py-3 font-semibold text-slate-500 uppercase text-xs tracking-wider text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {cart.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900 dark:text-white">{item.name}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">₹{item.price.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button 
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center font-semibold text-slate-900 dark:text-white">{item.quantity}</span>
                          <button 
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-slate-900 dark:text-white">₹{(item.price * item.quantity).toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 inline-flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Right Column - Checkout */}
      <div className="w-full lg:w-[400px] shrink-0 flex flex-col gap-6">
        
        {/* Customer Info Card */}
        <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200/60 dark:border-zinc-800 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Customer Info</h3>
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
               <User className="h-5 w-5" />
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Customer Number"
                value={customerInfo.customerNumberStr}
                onChange={(e) => setCustomerInfo({ ...customerInfo, customerNumberStr: e.target.value })}
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white"
              />
            </div>

            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                required
                type="text"
                placeholder="Customer Name *"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white"
              />
              {/* Customer Search Results */}
              {customerSearchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 z-50 max-h-[200px] overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#18181b] shadow-lg p-1 custom-scrollbar">
                  {customerSearchResults.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setCustomerInfo({
                          customerNumberStr: c.customerNumber ? c.customerNumber.toString() : '',
                          name: c.name,
                          phone: c.phone || '',
                          email: c.email || ''
                        });
                        setCustomerSearchResults([]);
                      }}
                      className="flex w-full flex-col px-3 py-2 text-left rounded-lg transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {c.customerNumber ? `#${c.customerNumber} - ` : ''}{c.name}
                      </span>
                      <span className="text-xs text-slate-500">{c.phone}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="tel"
                placeholder="Phone Number"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Checkout Summary Card */}
        <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200/60 dark:border-zinc-800 shadow-sm p-6 flex flex-col flex-1 min-h-0">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-6">Payment Summary</h3>
          
          <div className="space-y-3 text-sm flex-1">
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span>Subtotal</span>
              <span className="font-medium text-slate-900 dark:text-white">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span>Tax ({globalTaxRate}%)</span>
              <span className="font-medium text-slate-900 dark:text-white">₹{tax.toFixed(2)}</span>
            </div>
            <div className="pt-4 mt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center">
                 <span className="text-base font-bold text-slate-900 dark:text-white">Total</span>
                 <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 tracking-tight">₹{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-6 space-y-3">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount Paid</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-lg font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              
              <div className="flex justify-between items-center px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                 <span className="text-xs font-semibold text-slate-500 uppercase">Balance Due</span>
                 <span className={cn("text-sm font-bold", pendingAmount > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400")}>
                   {pendingAmount > 0 ? `₹${pendingAmount.toFixed(2)}` : "Paid in Full"}
                 </span>
              </div>
            </div>

            <div className="pt-6 space-y-3">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                <PaymentMethodButton 
                  active={paymentMethod === 'cash'} 
                  onClick={() => setPaymentMethod('cash')}
                  icon={Banknote}
                  label="Cash"
                />
                <PaymentMethodButton 
                  active={paymentMethod === 'upi'} 
                  onClick={() => setPaymentMethod('upi')}
                  icon={Smartphone}
                  label="UPI"
                />
                <PaymentMethodButton 
                  active={paymentMethod === 'card'} 
                  onClick={() => setPaymentMethod('card')}
                  icon={CreditCard}
                  label="Card"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || isProcessing}
            className="w-full h-14 mt-6 flex items-center justify-center space-x-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          >
            {isProcessing ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
            ) : (
              <span>Complete Transaction</span>
            )}
          </button>
        </div>
      </div>

      {/* Modals */}
      {isScannerOpen && (
        <QRScanner onScan={handleScan} onClose={() => setIsScannerOpen(false)} />
      )}

      {isManualAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-slate-800/20">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Manual Item Entry</h2>
                <p className="text-xs font-medium text-slate-500 mt-1">Search and select an item to add to the cart</p>
              </div>
              <button 
                onClick={() => setIsManualAddOpen(false)} 
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search inventory..."
                  value={modalSearchTerm}
                  onChange={(e) => setModalSearchTerm(e.target.value)}
                  className="w-full h-11 pl-9 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white"
                />
              </div>
              
              <div className="max-h-[300px] overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#18181b] p-2 custom-scrollbar">
                {modalSearchResults.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-sm">
                    No products found matching your search.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {modalSearchResults.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        disabled={p.stock <= 0}
                        onClick={() => {
                          setManualProduct({
                            id: p.id,
                            name: p.name,
                            price: p.price,
                            quantity: 1
                          });
                        }}
                        className={cn(
                          "flex w-full items-center justify-between p-3 text-left transition-colors rounded-lg",
                          manualProduct.id === p.id 
                            ? "bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30" 
                            : p.stock <= 0 
                              ? "opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-800/50" 
                              : "hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent"
                        )}
                      >
                        <div>
                          <p className={cn("text-sm font-semibold", manualProduct.id === p.id ? "text-indigo-700 dark:text-indigo-400" : "text-slate-900 dark:text-white")}>{p.name}</p>
                          <div className="flex items-center space-x-2 mt-0.5">
                            <span className="text-xs text-slate-500">Stock: {p.stock}</span>
                            {p.stock <= 0 && <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">Out of stock</span>}
                          </div>
                        </div>
                        <span className={cn("font-bold", manualProduct.id === p.id ? "text-indigo-700 dark:text-indigo-400" : "text-slate-900 dark:text-white")}>₹{p.price.toFixed(2)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {manualProduct.id && (
                <form onSubmit={handleManualAdd} className="pt-4 border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2">
                  <div className="flex items-end gap-4">
                    <div className="space-y-1.5 flex-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Quantity</label>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => setManualProduct(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))}
                          className="w-11 h-11 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <input
                          required
                          type="number"
                          min="1"
                          value={manualProduct.quantity}
                          onChange={(e) => setManualProduct({ ...manualProduct, quantity: parseInt(e.target.value) || 1 })}
                          className="h-11 flex-1 min-w-0 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#18181b] text-center text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          onClick={() => setManualProduct(prev => ({ ...prev, quantity: prev.quantity + 1 }))}
                          className="w-11 h-11 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="h-11 px-6 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
                    >
                      Add to Cart
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Payment Successful</h2>
            <p className="mt-2 text-sm text-slate-500">The transaction has been processed and recorded.</p>
            
            <div className="mt-8 space-y-3">
              <button
                onClick={() => setShowSuccess(false)}
                className="w-full h-11 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                New Transaction
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    if (!lastSale) return;
                    const text = `Invoice from Vivasayi\nInvoice ID: ${lastSale.id}\nTotal: ₹${lastSale.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\nStatus: ${lastSale.pendingAmount > 0 ? 'PARTIAL' : 'PAID'}`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="flex h-10 items-center justify-center space-x-2 rounded-xl bg-[#25D366] text-white text-xs font-semibold hover:bg-[#20b858] transition-colors outline-none"
                >
                  <Smartphone className="h-4 w-4" />
                  <span>WhatsApp</span>
                </button>
                <button
                  onClick={() => {
                    if (lastSale) printInvoice(lastSale);
                  }}
                  className="flex h-10 items-center justify-center space-x-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors outline-none"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print Receipt</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PaymentMethodButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center py-3 rounded-xl border transition-colors outline-none",
        active 
          ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400" 
          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
      )}
    >
      <Icon className="h-5 w-5 mb-1.5" />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
