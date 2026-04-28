import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, Timestamp, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { format } from 'date-fns';
import {
  Search,
  Download,
  Eye,
  User,
  History as HistoryIcon,
  Trash2,
  AlertCircle,
  X,
  CreditCard,
  Banknote,
  Smartphone,
  Printer
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { cn } from '../lib/utils';

export function SalesHistory() {
  const [sales, setSales] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPayment, setFilterPayment] = useState('all');
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const q = query(collection(db, 'sales'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSales(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: (doc.data().createdAt as Timestamp)?.toDate() || new Date()
      })));
    });
    return unsubscribe;
  }, []);

  const filteredSales = sales.filter(sale => {
    const searchMatch =
      sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sale.customerInfo?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

    const paymentMatch = filterPayment === 'all' || sale.paymentMethod === filterPayment;

    return searchMatch && paymentMatch;
  });

  const pagedSales = filteredSales.slice(0, rowsPerPage);

  const printTransactionList = () => {
    const doc = new (window as any).jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(79, 70, 229); // indigo-600
    doc.text('SALES HISTORY', 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Date: ${new Date().toLocaleString()}`, 105, 30, { align: 'center' });

    const tableData = filteredSales.map((sale: any, index: number) => [
      index + 1,
      sale.id.slice(0, 8).toUpperCase(),
      sale.customerInfo?.name || 'Walk-in',
      format(sale.date, 'MMM dd, yyyy HH:mm'),
      sale.paymentMethod.toUpperCase(),
      `INR ${sale.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['#', 'Transaction ID', 'Customer', 'Date & Time', 'Payment', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }
    });

    doc.autoPrint();
    const pdfUrl = doc.output('bloburl');
    window.open(pdfUrl, '_blank');
  };

  const deleteSale = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this sales record?')) {
      try {
        await deleteDoc(doc(db, 'sales', id));
      } catch (error) {
        console.error('Error deleting sale:', error);
        alert('Failed to delete sale');
      }
    }
  };

  const generateInvoiceDoc = (sale: any) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235);
    doc.text('INVOICE', 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Invoice ID: ${sale.id}`, 20, 40);
    doc.text(`Date: ${format(sale.date, 'MMM dd, yyyy HH:mm')}`, 20, 45);
    doc.text(`Payment: ${sale.paymentMethod.toUpperCase()}`, 20, 50);

    // Customer Info
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Customer Details:', 20, 65);
    doc.setFontSize(10);
    doc.text(`Name: ${sale.customerInfo?.name || 'Walk-in Customer'}`, 20, 72);
    doc.text(`Phone: ${sale.customerInfo?.phone || 'N/A'}`, 20, 77);

    // Items Table
    const tableData = sale.items.map((item: any) => [
      item.name,
      item.quantity,
      `INR ${item.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `INR ${(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    ]);

    autoTable(doc, {
      startY: 85,
      head: [['Item', 'Qty', 'Unit Price', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text(`Total Amount: INR ${sale.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 140, finalY);
    if (sale.pendingAmount > 0) {
      doc.setTextColor(220, 38, 38);
      doc.text(`Pending: INR ${sale.pendingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 140, finalY + 7);
    }

    return doc;
  };

  const downloadInvoice = (sale: any) => {
    const doc = generateInvoiceDoc(sale);
    doc.save(`Invoice_${sale.id.slice(0, 8)}.pdf`);
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
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    html, body {
      background: white;
      font-family: 'Courier New', Courier, monospace;
      font-size: 40px; /* Adjust this ONE value to make the whole receipt larger/smaller */
      font-weight: bold;
      line-height: 1.4;
      color: #000;
    }
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
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
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
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 200);
    };
    window.onafterprint = function() {
      window.close();
    };
  <\/script>
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

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'cash': return <Banknote className="w-4 h-4" />;
      case 'card': return <CreditCard className="w-4 h-4" />;
      case 'upi': return <Smartphone className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      <header className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Sales History</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">View and manage all your past transactions</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={printTransactionList}
            className="h-11 px-4 flex items-center justify-center space-x-2 rounded-xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm text-sm font-semibold whitespace-nowrap outline-none"
          >
            <Printer className="h-4 w-4" />
            <span className="hidden lg:inline">Print List</span>
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200/60 dark:border-zinc-800 p-6 shadow-sm flex flex-col md:flex-row items-end gap-4">
        <div className="w-full flex-1 space-y-1.5">
          <label className="text-xs font-semibold text-slate-500">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white"
            />
          </div>
        </div>

        <div className="w-full md:w-48 space-y-1.5">
          <label className="text-xs font-semibold text-slate-500">Payment Method</label>
          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white"
          >
            <option value="all">All Methods</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="upi">UPI</option>
          </select>
        </div>

        <div className="w-full md:w-32 space-y-1.5">
          <label className="text-xs font-semibold text-slate-500">Rows</label>
          <select
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white"
          >
            <option value={10}>10 rows</option>
            <option value={20}>20 rows</option>
            <option value={50}>50 rows</option>
            <option value={100}>100 rows</option>
          </select>
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200/60 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Transaction ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Total</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {pagedSales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <HistoryIcon className="w-8 h-8 opacity-50" />
                      </div>
                      <p className="text-sm font-medium">No sales records found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pagedSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white uppercase">
                        #{sale.id.slice(0, 8)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {sale.customerInfo?.name || 'Walk-in'}
                          </p>
                          {sale.customerInfo?.phone && (
                            <p className="text-xs text-slate-500">{sale.customerInfo.phone}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{format(sale.date, 'MMM dd, yyyy')}</p>
                      <p className="text-xs text-slate-500">{format(sale.date, 'hh:mm a')}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="text-slate-400 dark:text-slate-500">
                          {getPaymentIcon(sale.paymentMethod)}
                        </div>
                        <span className="text-sm font-medium capitalize text-slate-700 dark:text-slate-300">
                          {sale.paymentMethod}
                        </span>
                        {sale.pendingAmount > 0 && (
                          <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                            PARTIAL
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">₹{sale.total.toLocaleString('en-IN')}</p>
                      {sale.pendingAmount > 0 && (
                        <p className="text-xs font-semibold text-red-500 mt-0.5">Due: ₹{sale.pendingAmount.toLocaleString()}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => setSelectedSale(sale)}
                          className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => downloadInvoice(sale)}
                          className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                          title="Download Invoice"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => printInvoice(sale)}
                          className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                          title="Print Invoice"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteSale(sale.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sale Detail Modal */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-slate-800/20">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Transaction Details</h2>
                <div className="flex items-center mt-1.5 space-x-3 text-sm text-slate-500">
                  <span className="font-medium">#{selectedSale.id}</span>
                  <span>•</span>
                  <span>{format(selectedSale.date, 'MMM dd, yyyy HH:mm')}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedSale(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

              {/* Customer & Payment Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Customer</h3>
                  <div className="bg-slate-50 dark:bg-[#18181b] rounded-xl p-4 border border-slate-200/60 dark:border-zinc-800 h-full">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {selectedSale.customerInfo?.name || 'Walk-in Customer'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {selectedSale.customerInfo?.phone || 'No phone provided'}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Payment</h3>
                  <div className="bg-slate-50 dark:bg-[#18181b] rounded-xl p-4 border border-slate-200/60 dark:border-zinc-800 h-full flex flex-col justify-center">
                    <div className="flex items-center space-x-2 text-sm font-semibold text-slate-900 dark:text-white capitalize">
                      {getPaymentIcon(selectedSale.paymentMethod)}
                      <span>{selectedSale.paymentMethod}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Purchased Items</h3>
                <div className="bg-white dark:bg-[#18181b] rounded-xl border border-slate-200/60 dark:border-zinc-800 overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200/60 dark:border-zinc-800">
                        <th className="px-4 py-3 font-semibold text-slate-500">Item</th>
                        <th className="px-4 py-3 font-semibold text-slate-500 text-center">Qty</th>
                        <th className="px-4 py-3 font-semibold text-slate-500 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {selectedSale.items.map((item: any, i: number) => (
                        <tr key={i}>
                          <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{item.name}</td>
                          <td className="px-4 py-3 text-center text-slate-500">{item.quantity}</td>
                          <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-white">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200/60 dark:border-zinc-800 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-slate-500">Subtotal</span>
                      <span className="font-bold text-slate-900 dark:text-white">₹{selectedSale.total.toLocaleString()}</span>
                    </div>
                    {selectedSale.pendingAmount > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-semibold text-red-500 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Pending Dues
                        </span>
                        <span className="font-bold text-red-500">₹{selectedSale.pendingAmount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex space-x-3">
              <button
                onClick={() => setSelectedSale(null)}
                className="flex-1 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => downloadInvoice(selectedSale)}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Invoice</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
