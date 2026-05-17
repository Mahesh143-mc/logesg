import { useState, useEffect, ChangeEvent } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Plus, Search, Edit2, Trash2, QrCode, X, Upload, CheckCircle2, Package, LayoutGrid, AlertTriangle, Scale, Printer, Download, Eye, EyeOff } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { cn } from '../lib/utils';
import { QRCodeSVG } from 'qrcode.react';
import CryptoJS from 'crypto-js';
import { Cloudinary } from '@cloudinary/url-gen';
import { auto } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { AdvancedImage } from '@cloudinary/react';
import * as XLSX from 'xlsx';

const CLOUDINARY_CLOUD_NAME = 'dyaufjpai';
const CLOUDINARY_API_KEY = '692887168924367';
const CLOUDINARY_API_SECRET = 'FgZrRjQGM1wRldX_UBMErw1qyGU';

const cld = new Cloudinary({ cloud: { cloudName: CLOUDINARY_CLOUD_NAME } });

export function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [rowsPerPage, setRowsPerPage] = useState(18);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<any>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [newProductId, setNewProductId] = useState('');
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitAllowDecimal, setNewUnitAllowDecimal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: 0,
    costPrice: 0,
    stock: 0,
    lowStockThreshold: 5,
    imageUrl: '',
    publicId: '',
    unit: '',
    visible: true
  });

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'categories'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      setCategories(cats);
      if (cats.length > 0 && !formData.category) {
        setFormData(prev => ({ ...prev, category: cats[0].name }));
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'units'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedUnits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      setUnits(fetchedUnits);
      if (fetchedUnits.length > 0 && !formData.unit) {
        setFormData(prev => ({ ...prev, unit: fetchedUnits[0].name }));
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAddCategory = async (e: any) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      await addDoc(collection(db, 'categories'), {
        name: newCategoryName.trim(),
        createdAt: serverTimestamp()
      });
      setNewCategoryName('');
      setIsCategoryModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to add category');
    }
  };

  const handleAddUnit = async (e: any) => {
    e.preventDefault();
    if (!newUnitName.trim()) return;
    try {
      if (editingUnit) {
        await updateDoc(doc(db, 'units', editingUnit.id), {
          name: newUnitName.trim(),
          allowDecimal: newUnitAllowDecimal,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'units'), {
          name: newUnitName.trim(),
          allowDecimal: newUnitAllowDecimal,
          createdAt: serverTimestamp()
        });
      }
      setNewUnitName('');
      setNewUnitAllowDecimal(false);
      setEditingUnit(null);
      setIsUnitModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save unit');
    }
  };

  const handleDeleteUnit = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this unit?')) {
      try {
        await deleteDoc(doc(db, 'units', id));
      } catch (err) {
        console.error(err);
        alert('Failed to delete unit');
      }
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadToCloudinary = async (file: File) => {
    try {
      const timestamp = Math.round(new Date().getTime() / 1000);
      const folder = 'billing';
      // Cloudinary signature: SHA1 of all parameters in alphabetical order, then append secret
      // Parameters: folder, timestamp
      const signature = CryptoJS.SHA1(`folder=${folder}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`).toString();

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', CLOUDINARY_API_KEY);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('folder', folder);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Cloudinary upload failed');
      }

      return { url: data.secure_url, publicId: data.public_id };
    } catch (err) {
      console.error('Upload function error:', err);
      throw err;
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      let imageUrl = formData.imageUrl;
      let publicId = formData.publicId;

      if (imageFile) {
        try {
          const uploadResult = await uploadToCloudinary(imageFile);
          imageUrl = uploadResult.url;
          publicId = uploadResult.publicId;
        } catch (uploadErr: any) {
          alert(`Image Upload Failed: ${uploadErr.message}`);
          setIsUploading(false);
          return; // Stop submission if upload fails
        }
      }

      const productData = {
        ...formData,
        imageUrl,
        publicId,
        updatedAt: serverTimestamp(),
      };

      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), productData);
        setIsModalOpen(false);
      } else {
        const docRef = await addDoc(collection(db, 'products'), {
          ...productData,
          createdAt: serverTimestamp(),
        });
        setNewProductId(docRef.id);
        setIsModalOpen(false);
        setIsQrModalOpen(true);
      }
      
      setEditingProduct(null);
      setFormData({ name: '', description: '', category: '', price: 0, costPrice: 0, stock: 0, lowStockThreshold: 5, imageUrl: '', publicId: '', unit: units.length > 0 ? units[0].name : '', visible: true });
      setImageFile(null);
      setImagePreview(null);
    } catch (err: any) {
      console.error('Firestore Error:', err);
      alert(`Failed to save product: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const renderProductImage = (product: any) => {
    // If the image was uploaded with the old Cloudinary cloudName (dkt1z4j0r), 
    // fall back to rendering standard img using its original imageUrl.
    const isOldCloudinary = product.imageUrl && product.imageUrl.includes('/dkt1z4j0r/');

    if (product.publicId && !isOldCloudinary) {
      const img = cld
        .image(product.publicId)
        .format('auto')
        .quality('auto')
        .resize(auto().gravity(autoGravity()).width(120).height(120));
      return <AdvancedImage cldImg={img} className="h-full w-full object-contain" />;
    } else if (product.imageUrl) {
      return <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain" referrerPolicy="no-referrer" />;
    } else {
      return (
        <div className="flex h-full w-full items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600">
           <Package className="h-8 w-8" />
        </div>
      );
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingProductId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingProductId) {
      await deleteDoc(doc(db, 'products', deletingProductId));
      setIsDeleteModalOpen(false);
      setDeletingProductId(null);
    }
  };

  const downloadQRCode = (productId: string) => {
    const svg = document.querySelector(`#qr-view-${productId} svg`) || document.querySelector('.qr-container svg');
    if (svg) {
      const svgData = new window.XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new window.Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `qr-${productId}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  const printQRCode = (productId: string, productName: string) => {
    const svg = document.querySelector(`#qr-view-${productId} svg`);
    if (svg) {
      const svgData = new window.XMLSerializer().serializeToString(svg);
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Print QR Code - ${productName}</title>
              <style>
                body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: sans-serif; }
                .container { text-align: center; border: 1px solid #eee; padding: 40px; border-radius: 20px; }
                h1 { margin-bottom: 20px; font-size: 24px; }
                img { width: 300px; height: 300px; }
                p { margin-top: 20px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>${productName}</h1>
                <img src="data:image/svg+xml;base64,${btoa(svgData)}" />
                <p>Product ID: ${productId}</p>
              </div>
              <script>
                window.onload = () => {
                  window.print();
                  window.onafterprint = () => window.close();
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  const filteredProducts = products.filter(p => {
    const searchMatch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.category || '').toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = filterCategory === 'all' || p.category === filterCategory;
    return searchMatch && categoryMatch;
  });

  const pagedProducts = filteredProducts.slice(0, rowsPerPage);

  const exportToExcel = () => {
    const headers = ['Product ID', 'Name', 'Description', 'Category', 'Selling Price', 'Total Stock', 'Low Stock Alert', 'Unit'];
    
    const rows = filteredProducts.map((p: any) => [
      p.id,
      p.name,
      p.description || '',
      p.category || 'N/A',
      p.price,
      p.stock,
      p.lowStockThreshold || 5,
      p.unit || 'pcs'
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

    XLSX.writeFile(workbook, `products_export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      
      {/* Header section */}
      <header className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Products</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage your inventory and product catalog</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={exportToExcel}
            className="h-11 px-4 flex items-center justify-center space-x-2 rounded-xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm text-sm font-semibold whitespace-nowrap outline-none"
          >
            <Download className="h-4 w-4" />
            <span className="hidden lg:inline">Export Excel</span>
          </button>
          <button
            onClick={() => setIsUnitModalOpen(true)}
            className="h-11 px-4 flex items-center justify-center space-x-2 rounded-xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm text-sm font-semibold whitespace-nowrap outline-none"
          >
            <Scale className="h-4 w-4" />
            <span>Add Unit</span>
          </button>
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="h-11 px-4 flex items-center justify-center space-x-2 rounded-xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm text-sm font-semibold whitespace-nowrap outline-none"
          >
            <LayoutGrid className="h-4 w-4" />
            <span>Add Category</span>
          </button>
          <button
            onClick={() => {
              setEditingProduct(null);
              setFormData({ 
                name: '', 
                description: '',
                category: categories.length > 0 ? categories[0].name : '', 
                price: 0, 
                costPrice: 0, 
                stock: 0, 
                lowStockThreshold: 5, 
                imageUrl: '', 
                publicId: '',
                unit: units.length > 0 ? units[0].name : '',
                visible: true
              });
              setImageFile(null);
              setImagePreview(null);
              setIsModalOpen(true);
            }}
            className="h-11 px-4 flex items-center justify-center space-x-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm whitespace-nowrap outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </button>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-11 pl-9 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#18181b] text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white shadow-sm"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#18181b] text-sm font-medium text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm appearance-none"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          <select
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
            className="h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#18181b] text-sm font-medium text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm appearance-none"
          >
            <option value={12}>Show 12</option>
            <option value={18}>Show 18</option>
            <option value={24}>Show 24</option>
            <option value={60}>Show 60</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {pagedProducts.map((product) => (
          <div 
            key={product.id} 
            onClick={() => setViewingProduct(product)}
            className="group cursor-pointer bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200/60 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-colors"
          >
            {/* Image Area */}
            <div className="relative h-40 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-800/20 p-4">
              {renderProductImage(product)}
              
              {/* Overlay Actions (Desktop) */}
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex items-center justify-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingProduct(product);
                    setFormData({
                      name: product.name,
                      description: product.description || '',
                      category: product.category || (categories.length > 0 ? categories[0].name : ''),
                      price: product.price,
                      costPrice: product.costPrice || 0,
                      stock: product.stock,
                      lowStockThreshold: product.lowStockThreshold || 5,
                      imageUrl: product.imageUrl || '',
                      publicId: product.publicId || '',
                      unit: product.unit || (units.length > 0 ? units[0].name : ''),
                      visible: product.visible !== false
                    });
                    setImagePreview(product.imageUrl || null);
                    setIsModalOpen(true);
                  }}
                  className="p-2.5 rounded-xl bg-white text-slate-700 hover:text-indigo-600 hover:scale-110 transition-all shadow-sm"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(product.id);
                  }}
                  className="p-2.5 rounded-xl bg-white text-slate-700 hover:text-red-600 hover:scale-110 transition-all shadow-sm"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Status Badge */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {!product.visible && (
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-md flex items-center gap-1">
                    <EyeOff className="w-3 h-3" />
                    Hidden
                  </span>
                )}
              </div>
              <div className="absolute top-3 right-3">
                 <span className={cn(
                  "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                  product.stock <= (product.lowStockThreshold || 5) 
                    ? 'bg-red-500 text-white shadow-sm' 
                    : 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20'
                )}>
                  {product.stock <= (product.lowStockThreshold || 5) ? 'Low Stock' : 'In Stock'}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-3 flex-1 flex flex-col">
              <div className="mb-2">
                <div className="text-[10px] text-slate-500 font-medium mb-0.5">{product.category || 'Uncategorized'}</div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white tracking-tight line-clamp-1">{product.name}</h3>
              </div>
              
              <div className="mt-auto flex items-end justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight">₹{product.price.toFixed(2)}</span>
                  <span className="text-[10px] font-medium text-slate-500">
                    {product.stock} {product.unit || 'pcs'}
                  </span>
                </div>
                
                {/* Mobile Actions */}
                <div className="flex items-center gap-1.5 md:hidden">
                   <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingProduct(product);
                      setFormData({
                        name: product.name,
                        description: product.description || '',
                        category: product.category || (categories.length > 0 ? categories[0].name : ''),
                        price: product.price,
                        costPrice: product.costPrice || 0,
                        stock: product.stock,
                        lowStockThreshold: product.lowStockThreshold || 5,
                        imageUrl: product.imageUrl || '',
                        publicId: product.publicId || '',
                        unit: product.unit || (units.length > 0 ? units[0].name : ''),
                        visible: product.visible !== false
                      });
                      setImagePreview(product.imageUrl || null);
                      setIsModalOpen(true);
                    }}
                    className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 active:scale-95 transition-all"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(product.id);
                    }}
                    className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 active:scale-95 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {pagedProducts.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-500 text-center">
            <Package className="w-12 h-12 mb-4 text-slate-300 dark:text-slate-600" />
            <p className="text-base font-medium text-slate-900 dark:text-white">No products found</p>
            <p className="text-sm mt-1">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>

      {/* Product Details Modal */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-slate-800/20">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Product Details</h2>
                <p className="text-sm text-slate-500 mt-1">{viewingProduct.name}</p>
              </div>
              <button 
                onClick={() => setViewingProduct(null)} 
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Image Section */}
                <div className="w-full sm:w-1/3 h-40 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 overflow-hidden p-4">
                  {renderProductImage(viewingProduct)}
                </div>
                
                {/* Info Section */}
                <div className="w-full sm:w-2/3 grid grid-cols-2 gap-4">
                  <div className="col-span-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Name</label>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{viewingProduct.name}</p>
                  </div>
                  {viewingProduct.description && (
                    <div className="col-span-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Description</label>
                      <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{viewingProduct.description}</p>
                    </div>
                  )}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Category</label>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{viewingProduct.category || 'N/A'}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Selling Price</label>
                    <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">₹{viewingProduct.price.toFixed(2)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Cost Price</label>
                    <p className="text-lg font-bold text-slate-500">₹{(viewingProduct.costPrice || 0).toFixed(2)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Stock</label>
                    <p className={cn("text-lg font-bold", viewingProduct.stock <= (viewingProduct.lowStockThreshold || 5) ? 'text-red-500' : 'text-emerald-500')}>
                      {viewingProduct.stock} {viewingProduct.unit || 'pcs'}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Alert Threshold</label>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{viewingProduct.lowStockThreshold || 5} {viewingProduct.unit || 'pcs'}</p>
                  </div>
                </div>
              </div>

              {/* QR Code Section */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Product QR Code</h3>
                <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                  <div id={`qr-view-${viewingProduct.id}`} className="p-4 bg-white rounded-xl border border-slate-200">
                    <QRCodeSVG value={viewingProduct.id} size={120} />
                  </div>
                  <div className="flex-1 space-y-3 w-full sm:w-auto">
                    <p className="text-xs text-slate-500 text-center sm:text-left">Scan this code to quickly add this product to the cart during checkout.</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => downloadQRCode(viewingProduct.id)}
                        className="flex-1 h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors outline-none"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => printQRCode(viewingProduct.id, viewingProduct.name)}
                        className="flex-1 h-10 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors outline-none"
                      >
                        Print
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xl animate-in zoom-in-95 duration-200 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400">
              <Trash2 className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Delete Product?</h2>
            <p className="text-sm text-slate-500 mb-6">This action cannot be undone. The product will be permanently removed.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 h-11 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors outline-none"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 h-11 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors outline-none focus:ring-2 focus:ring-red-500/50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add Category</h2>
                <p className="text-sm text-slate-500 mt-1">Create a new product category</p>
              </div>
              <button onClick={() => setIsCategoryModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Category Name</label>
                <input
                  required
                  autoFocus
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Electronics"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#18181b] text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                Save Category
              </button>
            </form>
            
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Existing Categories</h3>
              <div className="max-h-40 overflow-y-auto custom-scrollbar">
                {categories.length === 0 ? (
                  <p className="py-4 text-sm text-slate-500 text-center">No categories found</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <span key={cat.id} className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 capitalize">
                        {cat.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unit Management Modal */}
      {isUnitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex flex-col md:flex-row max-h-[90vh] md:h-[500px]">
              
              {/* Sidebar - Existing Units */}
              <div className="w-full md:w-72 bg-slate-50 dark:bg-slate-800/20 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 flex flex-col min-h-[200px] md:min-h-0">
                <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between md:block">
                  <div>
                    <h3 className="text-xs md:text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Existing Units</h3>
                    <p className="text-[10px] md:text-[10px] text-slate-500 mt-1 font-medium">{units.length} defined</p>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 custom-scrollbar">
                  {units.map(u => (
                    <div 
                      key={u.id} 
                      className={cn(
                        "group flex items-center justify-between p-3 rounded-2xl border transition-all duration-300",
                        editingUnit?.id === u.id 
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                          : "bg-white dark:bg-[#18181b] border-slate-100 dark:border-slate-800 hover:border-indigo-500/30"
                      )}
                    >
                      <div className="flex flex-col">
                        <span className={cn(
                          "text-xs md:text-xs font-bold capitalize",
                          editingUnit?.id === u.id ? "text-white" : "text-slate-900 dark:text-white"
                        )}>{u.name}</span>
                        <span className={cn(
                          "text-[9px] md:text-[8px] font-black uppercase tracking-tighter mt-0.5",
                          editingUnit?.id === u.id ? "text-indigo-100" : "text-slate-500"
                        )}>
                          {u.allowDecimal ? 'Decimal' : 'Integer'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => {
                            setEditingUnit(u);
                            setNewUnitName(u.name);
                            setNewUnitAllowDecimal(u.allowDecimal);
                          }}
                          className={cn(
                            "p-1.5 rounded-lg transition-colors",
                            editingUnit?.id === u.id ? "hover:bg-white/20 text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600"
                          )}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteUnit(u.id)}
                          className={cn(
                            "p-1.5 rounded-lg transition-colors",
                            editingUnit?.id === u.id ? "hover:bg-white/20 text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-red-600"
                          )}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {units.length === 0 && (
                    <div className="py-8 md:py-12 text-center">
                      <Scale className="w-6 h-6 md:w-8 md:h-8 text-slate-200 dark:text-slate-700 mx-auto mb-2" />
                      <p className="text-[10px] md:text-[10px] text-slate-500 font-medium italic">No units yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Main Content - Form */}
              <div className="flex-1 p-6 md:p-8 flex flex-col bg-white dark:bg-slate-900 overflow-y-auto">
                <div className="flex items-start justify-between mb-6 md:mb-8">
                  <div>
                    <h2 className="text-xl md:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                      {editingUnit ? 'Edit Unit' : 'Create Unit'}
                    </h2>
                    <p className="text-xs md:text-xs text-slate-500 mt-1 font-medium">Define how you measure your products</p>
                  </div>
                  <button 
                    onClick={() => {
                      setIsUnitModalOpen(false);
                      setEditingUnit(null);
                      setNewUnitName('');
                      setNewUnitAllowDecimal(false);
                    }} 
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleAddUnit} className="space-y-6 md:space-y-8">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] md:text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Unit Name</label>
                      <input
                        required
                        autoFocus
                        type="text"
                        value={newUnitName}
                        onChange={(e) => setNewUnitName(e.target.value)}
                        placeholder="e.g. Kilograms (kg)"
                        className="w-full h-12 md:h-12 px-4 md:px-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white shadow-inner"
                      />
                    </div>

                    <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100/50 dark:border-indigo-500/10">
                      <label className="flex items-center space-x-4 cursor-pointer group">
                        <div 
                          onClick={() => setNewUnitAllowDecimal(!newUnitAllowDecimal)}
                          className={cn(
                            "w-12 h-6 rounded-full transition-all duration-500 relative",
                            newUnitAllowDecimal ? "bg-indigo-600 shadow-lg shadow-indigo-600/20" : "bg-slate-300 dark:bg-slate-700"
                          )}
                        >
                          <div className={cn(
                            "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-500 shadow-sm",
                            newUnitAllowDecimal ? "left-7" : "left-1"
                          )} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs md:text-xs font-bold text-slate-900 dark:text-white">Allow Decimal Quantity</span>
                          <span className="text-[10px] md:text-[10px] text-slate-500 mt-0.5">Supports fractional weights like 1.5kg, 0.75kg</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    {editingUnit && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingUnit(null);
                          setNewUnitName('');
                          setNewUnitAllowDecimal(false);
                        }}
                        className="flex-1 h-12 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all uppercase tracking-widest"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className="flex-[2] h-12 rounded-2xl bg-indigo-600 text-white text-xs font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 uppercase tracking-widest"
                    >
                      {editingUnit ? 'Update Unit' : 'Create Unit'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-slate-800/20">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {editingProduct ? 'Edit Product' : 'Add Product'}
                </h2>
                <p className="text-sm text-slate-500 mt-1">Fill in the product details below</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="relative h-32 w-32 overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center text-slate-500">
                      <Upload className="h-6 w-6 mb-2" />
                      <span className="text-xs font-semibold">Upload Image</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                </div>
                <p className="text-xs text-slate-500">Recommended size: 500x500px</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Product Name</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#18181b] text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#18181b] text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white resize-none"
                    placeholder="Enter product description (optional)..."
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#18181b] text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white appearance-none"
                    >
                      {categories.length === 0 && <option value="">No categories found</option>}
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Selling Price</label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#18181b] text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Total Stock</label>
                    <input
                      required
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#18181b] text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Unit</label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#18181b] text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white appearance-none"
                    >
                      {units.length === 0 && <option value="">No units found</option>}
                      {units.map(u => (
                        <option key={u.id} value={u.name}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Low Stock Alert</label>
                    <input
                      type="number"
                      value={formData.lowStockThreshold}
                      onChange={(e) => setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value) })}
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#18181b] text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white"
                    />
                  </div>
                </div>

                {/* Visibility Toggle */}
                <div className="pt-2">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">Visible to Customers</span>
                      <span className="text-xs text-slate-500">Hide or show this product in the shop</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, visible: !formData.visible })}
                      className={cn(
                        "w-12 h-6 rounded-full transition-all duration-300 relative",
                        formData.visible ? "bg-emerald-500 shadow-lg shadow-emerald-500/20" : "bg-slate-300 dark:bg-slate-700"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300",
                        formData.visible ? "left-7" : "left-1"
                      )} />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-11 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 h-11 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  {isUploading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                      <span>Saving...</span>
                    </div>
                  ) : editingProduct ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Generated Modal */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-8 text-center shadow-xl animate-in zoom-in-95 duration-200">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Product Added</h2>
            <p className="text-sm text-slate-500 mb-8">Scan or download the QR code below for checkout</p>
            
            <div className="qr-container mx-auto flex h-48 w-48 items-center justify-center rounded-2xl bg-slate-50 dark:bg-[#18181b] border border-slate-100 dark:border-slate-800 p-6 mb-8">
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <QRCodeSVG value={newProductId} size={120} />
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setIsQrModalOpen(false);
                  setNewProductId('');
                }}
                className="w-full h-11 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                Done
              </button>
              <button
                onClick={() => downloadQRCode(newProductId)}
                className="w-full h-11 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors outline-none"
              >
                Download QR Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
