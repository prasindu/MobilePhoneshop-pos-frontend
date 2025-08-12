import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios'; // Import axios
import { 
  ShoppingCart, Plus, Minus, Trash2, DollarSign, Package, 
  BarChart3, Calendar, User, LogOut, Search, Eye, 
  TrendingUp, TrendingDown, Download, Receipt, Phone, 
  MapPin, Mail, Clock, X, Edit, Save, 
  PlusCircle, Filter, Barcode, Printer, RefreshCw, Upload, Image
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// Enhanced database with sample data
const DATABASE = {
  users: [
    { id: 1, username: 'admin', password: 'admin123', role: 'manager', name: 'Admin User' },
    { id: 2, username: 'cashier', password: 'cash123', role: 'cashier', name: 'John Cashier' }
  ],
  categories: ['smartphones', 'accessories', 'laptops', 'tablets', 'wearables'],
  products: [
    {
      id: 1,
      name: 'iPhone 15 Pro',
      receivedPrice: 800,
      sellingPrice: 999,
      description: 'Latest iPhone with titanium build',
      stock: 25,
      category: 'smartphones',
      barcode: 'IPH15PRO001',
      image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop'
    },
    {
      id: 2,
      name: 'Samsung Galaxy S24',
      receivedPrice: 700,
      sellingPrice: 899,
      description: 'Premium Android flagship',
      stock: 18,
      category: 'smartphones',
      barcode: 'SGS24001',
      image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop'
    },
    {
      id: 3,
      name: 'MacBook Air M3',
      receivedPrice: 1000,
      sellingPrice: 1299,
      description: '13-inch laptop with M3 chip',
      stock: 12,
      category: 'laptops',
      barcode: 'MBA13M3001',
      image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=400&fit=crop'
    },
    {
      id: 4,
      name: 'iPad Pro',
      receivedPrice: 600,
      sellingPrice: 799,
      description: '11-inch tablet with M4 chip',
      stock: 8,
      category: 'tablets',
      barcode: 'IPADPRO11001',
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop'
    },
    {
      id: 5,
      name: 'AirPods Pro',
      receivedPrice: 150,
      sellingPrice: 249,
      description: 'Wireless earbuds with noise cancellation',
      stock: 30,
      category: 'accessories',
      barcode: 'AIRPODSPRO001',
      image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=400&fit=crop'
    }
  ],
  sales: [
    {
      id: 'INV-20241201001',
      date: '2024-12-01',
      time: '10:30:00',
      items: [
        { productId: 1, productName: 'iPhone 15 Pro', quantity: 1, unitPrice: 999 },
        { productId: 5, productName: 'AirPods Pro', quantity: 1, unitPrice: 249 }
      ],
      total: 1248,
      profit: 348,
      customerInfo: { name: 'John Doe', phone: '555-0123' },
      notes: 'Customer requested gift wrapping',
      cashier: 'admin'
    }
  ],
  storeInfo: {
    name: 'MobileHub',
    tagline: 'Your Mobile Technology Partner',
    address: '123 Tech Street, Digital City, DC 12345',
    phone: '+1 (555) 123-4567',
    email: 'info@mobilehub.com',
    website: 'www.mobilehub.com',
    taxId: 'TX123456789'
  }
};

const POSSystem = () => {
  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  // Main application state
  const [activeTab, setActiveTab] = useState('billing');
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState(DATABASE.products);
  const [sales, setSales] = useState(DATABASE.sales);
  const [categories, setCategories] = useState(DATABASE.categories);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Customer information state
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  // Billing state
  const [billNotes, setBillNotes] = useState('');
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('percentage');
  const [showCustomItemForm, setShowCustomItemForm] = useState(false);
  const [customItem, setCustomItem] = useState({
    name: '',
    price: '',
    quantity: 1,
    description: ''
  });
  
  // Product management state
  const [newProduct, setNewProduct] = useState({
    name: '',
    receivedPrice: '',
    sellingPrice: '',
    description: '',
    stock: '',
    category: 'smartphones',
    barcode: '',
    image: ''
  });
  const [newCategory, setNewCategory] = useState('');

  // Sales history state
  const [salesSearchTerm, setSalesSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState(null);
  const [showSaleDetails, setShowSaleDetails] = useState(false);

  // Date filter state
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: '',
    selectedDate: new Date().toISOString().split('T')[0],
    analyticsStartDate: '',
    analyticsEndDate: ''
  });

  // Inventory editing state
  const [editingProductId, setEditingProductId] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  // Barcode scanning state
  const [barcodeInput, setBarcodeInput] = useState('');

  // Category filter for products
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Return management state
  const [returnReason, setReturnReason] = useState('');
  const [returnItems, setReturnItems] = useState([]);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [saleToReturn, setSaleToReturn] = useState(null);

  // Image upload states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // Track upload progress
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);

  // Cloudinary configuration - REPLACE WITH YOUR OWN CREDENTIALS
  const CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/dkks7qctm/image/upload';
  const UPLOAD_PRESET = 'pos-img';

  // Function to upload image to Cloudinary
  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    
    try {
      const response = await axios.post(CLOUDINARY_UPLOAD_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      });
      return response.data.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Image upload failed. Please try again.');
    }
  };

  // Login handler
  const handleLogin = (e) => {
    e.preventDefault();
    const user = DATABASE.users.find(
      u => u.username === loginForm.username && u.password === loginForm.password
    );
    if (user) {
      setCurrentUser(user);
      setIsLoggedIn(true);
      setLoginForm({ username: '', password: '' });
    } else {
      alert('Invalid credentials');
    }
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    setCart([]);
    setCustomerInfo({ name: '', phone: '', email: '', address: '' });
    setBillNotes('');
    setDiscount(0);
    setEditingProductId(null);
    setEditingProduct(null);
  };

  // Image upload handler
  const handleImageUpload = async (event, isEditing = false) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      alert('File size too large. Please choose an image under 2MB.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    setUploadingImage(true);
    setUploadProgress(0);

    try {
      const imageUrl = await uploadImageToCloudinary(file);
      
      if (isEditing && editingProduct) {
        setEditingProduct(prev => ({ ...prev, image: imageUrl }));
      } else {
        setNewProduct(prev => ({ ...prev, image: imageUrl }));
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setUploadingImage(false);
      setUploadProgress(0);
    }
  };

  // Trigger file input
  const triggerImageUpload = (isEditing = false) => {
    if (isEditing) {
      editFileInputRef.current?.click();
    } else {
      fileInputRef.current?.click();
    }
  };

  // Add custom item to cart
  const addCustomItemToCart = () => {
    if (!customItem.name || !customItem.price) {
      alert('Please enter item name and price');
      return;
    }

    const item = {
      id: `custom-${Date.now()}`,
      name: customItem.name,
      sellingPrice: parseFloat(customItem.price),
      receivedPrice: 0,
      description: customItem.description || 'Custom item',
      quantity: parseInt(customItem.quantity),
      category: 'custom',
      barcode: 'CUSTOM',
      isCustom: true,
      discount: 0,
      discountType: 'percentage'
    };

    setCart(prev => [...prev, item]);
    setCustomItem({ name: '', price: '', quantity: 1, description: '' });
    setShowCustomItemForm(false);
  };

  // Add to cart
  const addToCart = (product) => {
    if (product.stock <= 0) {
      alert(`Sorry, ${product.name} is out of stock!`);
      return;
    }
    
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity + 1 > product.stock) {
          alert(`Only ${product.stock} units of ${product.name} available!`);
          return prev;
        }
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { 
        ...product, 
        quantity: 1,
        discount: 0,
        discountType: 'percentage'
      }];
    });
  };

  // Update cart quantity
  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.id !== productId));
    } else {
      const product = products.find(p => p.id === productId);
      if (!product) return;
      
      if (quantity > product.stock) {
        alert(`Only ${product.stock} units of ${product.name} available!`);
        return;
      }
      
      setCart(prev =>
        prev.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  // Update item discount
  const updateItemDiscount = (productId, discount, discountType) => {
    setCart(prev =>
      prev.map(item =>
        item.id === productId 
          ? { ...item, discount, discountType } 
          : item
      )
    );
  };

  // Calculate item price after discount
  const calculateItemPrice = (item) => {
    if (item.discountType === 'percentage') {
      return item.sellingPrice * (1 - item.discount / 100);
    }
    return Math.max(0, item.sellingPrice - item.discount);
  };

  // Calculate totals
  const getCartTotals = () => {
    const subtotal = cart.reduce((sum, item) => 
      sum + (item.sellingPrice * item.quantity), 0);
      
    const totalAfterItemDiscounts = cart.reduce((sum, item) => 
      sum + (calculateItemPrice(item) * item.quantity), 0);
      
    const discountAmount = discountType === 'percentage' 
      ? (totalAfterItemDiscounts * discount / 100) 
      : Math.min(discount, totalAfterItemDiscounts);
      
    const total = totalAfterItemDiscounts - discountAmount;
    const totalCost = cart.reduce((sum, item) => 
      sum + (item.receivedPrice * item.quantity), 0);
    const profit = total - totalCost;
    
    return { 
      subtotal, 
      discountAmount, 
      total, 
      profit,
      totalAfterItemDiscounts
    };
  };

  // Add new category
  const addCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories(prev => [...prev, newCategory]);
      setNewCategory('');
    }
  };

  // Complete sale
  const completeSale = () => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }

    const insufficientStockItems = cart.filter(item => {
      if (item.isCustom) return false;
      const product = products.find(p => p.id === item.id);
      return product.stock < item.quantity;
    });

    if (insufficientStockItems.length > 0) {
      alert(`Cannot complete sale: Insufficient stock for ${insufficientStockItems.map(i => i.name).join(', ')}`);
      return;
    }

    const { total, profit } = getCartTotals();

    const newSale = {
      id: `INV-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString(),
      items: cart.map(item => ({
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        unitPrice: item.sellingPrice,
        discount: item.discount,
        discountType: item.discountType,
        isCustom: item.isCustom || false
      })),
      total,
      profit,
      discount: discount,
      discountType: discountType,
      customerInfo: { ...customerInfo },
      notes: billNotes,
      cashier: currentUser.username
    };

    setSales(prev => [...prev, newSale]);
    
    setProducts(prev =>
      prev.map(product => {
        const cartItem = cart.find(item => item.id === product.id && !item.isCustom);
        if (cartItem) {
          return { ...product, stock: product.stock - cartItem.quantity };
        }
        return product;
      })
    );

    downloadBillPDF(newSale);

    setCart([]);
    setCustomerInfo({ name: '', phone: '', email: '', address: '' });
    setBillNotes('');
    setDiscount(0);
    
    alert(`Sale completed! Total: $${total.toFixed(2)}\nBill downloaded as HTML file.`);
  };

  // Print bill
  const printBill = (saleData) => {
    const billHTML = generateBillHTML(saleData);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(billHTML);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  // Generate PDF bill content
  const generateBillHTML = (saleData) => {
    const { subtotal, discountAmount, total } = getCartTotals();
    const currentDate = new Date();
    
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice - ${DATABASE.storeInfo.name}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4f46e5; padding-bottom: 20px; }
    .logo { font-size: 28px; font-weight: bold; color: #4f46e5; margin-bottom: 5px; }
    .tagline { color: #6b7280; font-style: italic; }
    .store-info { margin: 10px 0; font-size: 14px; color: #6b7280; }
    .invoice-details { display: flex; justify-content: space-between; margin: 30px 0; }
    .customer-info, .invoice-info { width: 48%; }
    .section-title { font-weight: bold; color: #4f46e5; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
    .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .items-table th, .items-table td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
    .items-table th { background: #f9fafb; font-weight: bold; }
    .items-table .text-right { text-align: right; }
    .totals { margin-top: 20px; }
    .totals-row { display: flex; justify-content: space-between; padding: 8px 0; }
    .totals-row.final { font-weight: bold; font-size: 18px; border-top: 2px solid #4f46e5; padding-top: 12px; }
    .notes { margin-top: 30px; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">${DATABASE.storeInfo.name}</div>
    <div class="tagline">${DATABASE.storeInfo.tagline}</div>
    <div class="store-info">
      <div>${DATABASE.storeInfo.address}</div>
      <div>Phone: ${DATABASE.storeInfo.phone} | Email: ${DATABASE.storeInfo.email}</div>
      <div>Website: ${DATABASE.storeInfo.website} | Tax ID: ${DATABASE.storeInfo.taxId}</div>
    </div>
  </div>

  <div class="invoice-details">
    <div class="customer-info">
      <div class="section-title">Bill To:</div>
      <div><strong>${customerInfo.name || 'Walk-in Customer'}</strong></div>
      ${customerInfo.phone ? `<div>Phone: ${customerInfo.phone}</div>` : ''}
      ${customerInfo.email ? `<div>Email: ${customerInfo.email}</div>` : ''}
      ${customerInfo.address ? `<div>Address: ${customerInfo.address}</div>` : ''}
    </div>
    
    <div class="invoice-info">
      <div class="section-title">Invoice Details:</div>
      <div><strong>Invoice #:</strong> ${saleData.id}</div>
      <div><strong>Date:</strong> ${currentDate.toLocaleDateString()}</div>
      <div><strong>Time:</strong> ${currentDate.toLocaleTimeString()}</div>
      <div><strong>Cashier:</strong> ${currentUser.username}</div>
    </div>
  </div>

  <table class="items-table">
    <thead>
      <tr>
        <th>Item</th>
        <th>Description</th>
        <th class="text-right">Unit Price</th>
        <th class="text-right">Discount</th>
        <th class="text-right">Discounted Price</th>
        <th class="text-right">Qty</th>
        <th class="text-right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${cart.map(item => {
        const discountedPrice = calculateItemPrice(item);
        return `
        <tr>
          <td><strong>${item.name}</strong><br><small>SKU: ${item.barcode}</small></td>
          <td>${item.description}</td>
          <td class="text-right">$${item.sellingPrice.toFixed(2)}</td>
          <td class="text-right">${
            item.discount > 0 
              ? `${item.discount}${item.discountType === 'percentage' ? '%' : '$'}` 
              : '-'
          }</td>
          <td class="text-right">$${discountedPrice.toFixed(2)}</td>
          <td class="text-right">${item.quantity}</td>
          <td class="text-right">$${(discountedPrice * item.quantity).toFixed(2)}</td>
        </tr>
        `;
      }).join('')}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row">
      <span>Subtotal:</span>
      <span>$${getCartTotals().subtotal.toFixed(2)}</span>
    </div>
    ${getCartTotals().discountAmount > 0 ? `
    <div class="totals-row">
      <span>Discount (${discountType === 'percentage' ? discount + '%' : '$' + discount}):</span>
      <span>-$${getCartTotals().discountAmount.toFixed(2)}</span>
    </div>
    ` : ''}
    <div class="totals-row final">
      <span>Total Amount:</span>
      <span>$${getCartTotals().total.toFixed(2)}</span>
    </div>
  </div>

  ${billNotes ? `
  <div class="notes">
    <div class="section-title">Notes:</div>
    <div>${billNotes}</div>
  </div>
  ` : ''}

  <div class="footer">
    <div>Thank you for shopping with ${DATABASE.storeInfo.name}!</div>
    <div>For support, please contact us at ${DATABASE.storeInfo.phone}</div>
  </div>
</body>
</html>`;
  };

  // Download PDF bill
  const downloadBillPDF = (saleData) => {
    const billHTML = generateBillHTML(saleData);
    const blob = new Blob([billHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${saleData.id}-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Add new product
  const addProduct = () => {
    if (!newProduct.name || !newProduct.receivedPrice || !newProduct.sellingPrice) {
      alert('Please fill in all required fields');
      return;
    }

    const product = {
      id: products.length + 1,
      ...newProduct,
      receivedPrice: parseFloat(newProduct.receivedPrice),
      sellingPrice: parseFloat(newProduct.sellingPrice),
      stock: parseInt(newProduct.stock) || 0,
      barcode: newProduct.barcode || `${Date.now()}`
    };

    setProducts(prev => [...prev, product]);
    setNewProduct({
      name: '',
      receivedPrice: '',
      sellingPrice: '',
      description: '',
      stock: '',
      category: 'smartphones',
      barcode: '',
      image: ''
    });
    alert('Product added successfully!');
  };

  // Start editing a product
  const startEditing = (product) => {
    setEditingProductId(product.id);
    setEditingProduct({ ...product });
  };

  // Save edited product
  const saveEditedProduct = () => {
    if (!editingProduct) return;
    
    const updatedProduct = {
      ...editingProduct,
      receivedPrice: parseFloat(editingProduct.receivedPrice),
      sellingPrice: parseFloat(editingProduct.sellingPrice),
      stock: parseInt(editingProduct.stock)
    };
    
    setProducts(prev =>
      prev.map(p => 
        p.id === editingProductId ? updatedProduct : p
      )
    );
    
    setEditingProductId(null);
    setEditingProduct(null);
    alert('Product updated successfully!');
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingProductId(null);
    setEditingProduct(null);
  };

  // Filter products for search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.includes(searchTerm) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter by category
  const getProductsByCategory = () => {
    if (selectedCategory === 'all') return filteredProducts;
    return filteredProducts.filter(p => p.category === selectedCategory);
  };

  // Handle barcode scanning
  const handleBarcodeScan = (e) => {
    e.preventDefault();
    if (!barcodeInput) return;
    
    const product = products.find(p => p.barcode === barcodeInput);
    if (product) {
      addToCart(product);
      setBarcodeInput('');
    } else {
      alert('Product not found!');
    }
  };

  // Filter sales by search term
  const filteredSales = sales.filter(sale =>
    sale.id.toLowerCase().includes(salesSearchTerm.toLowerCase()) ||
    (sale.customerInfo?.name || '').toLowerCase().includes(salesSearchTerm.toLowerCase()) ||
    (sale.customerInfo?.phone || '').includes(salesSearchTerm)
  );

  // Get sales data for charts with date filtering
  const getSalesChartData = () => {
    let startDate, endDate;
    
    if (dateFilter.analyticsStartDate && dateFilter.analyticsEndDate) {
      startDate = new Date(dateFilter.analyticsStartDate);
      endDate = new Date(dateFilter.analyticsEndDate);
    } else {
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 6);
    }

    const dateArray = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const daySales = sales.filter(sale => sale.date === dateStr);
      const total = daySales.reduce((sum, sale) => sum + sale.total, 0);
      const profit = daySales.reduce((sum, sale) => sum + sale.profit, 0);
      
      dateArray.push({
        date: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sales: total,
        profit: profit,
        transactions: daySales.length
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dateArray;
  };

  // Get today's sales
  const getTodaySales = () => {
    const today = new Date().toISOString().split('T')[0];
    return sales.filter(sale => sale.date === today);
  };

  // Get filtered sales by date range
  const getFilteredSales = () => {
    let filtered = sales;

    if (dateFilter.selectedDate && !dateFilter.startDate && !dateFilter.endDate) {
      filtered = filtered.filter(sale => sale.date === dateFilter.selectedDate);
    }

    if (dateFilter.startDate && dateFilter.endDate) {
      filtered = filtered.filter(sale => 
        sale.date >= dateFilter.startDate && sale.date <= dateFilter.endDate
      );
    }

    return filtered;
  };

  // Get category sales data
  const getCategorySalesData = () => {
    const categoryData = {};
    
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        const category = product?.category || 'custom';
        
        if (!categoryData[category]) {
          categoryData[category] = { revenue: 0, quantity: 0 };
        }
        
        categoryData[category].revenue += item.unitPrice * item.quantity;
        categoryData[category].quantity += item.quantity;
      });
    });

    return Object.entries(categoryData).map(([category, data]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      revenue: data.revenue,
      quantity: data.quantity
    }));
  };

  // Initialize return process
  const initReturn = (sale) => {
    setSaleToReturn(sale);
    setReturnItems(sale.items.map(item => ({ ...item, returnQty: 0 })));
    setShowReturnModal(true);
  };

  // Update return quantity
  const updateReturnQty = (index, quantity) => {
    setReturnItems(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, returnQty: Math.min(quantity, item.quantity) } : item
      )
    );
  };

  // Process return
  const processReturn = () => {
    const validReturns = returnItems.filter(item => item.returnQty > 0);
    if (validReturns.length === 0) {
      alert('No items selected for return');
      return;
    }

    const returnObj = {
      id: `RTN-${Date.now()}`,
      originalSaleId: saleToReturn.id,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString(),
      items: validReturns.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.returnQty,
        unitPrice: item.unitPrice,
        reason: returnReason
      })),
      totalRefund: validReturns.reduce((sum, item) => sum + (item.unitPrice * item.returnQty), 0),
      cashier: currentUser.username
    };

    // Create a return entry (marked as return)
    setSales(prev => [...prev, {
      ...saleToReturn,
      id: returnObj.id,
      total: -returnObj.totalRefund,
      profit: -validReturns.reduce((sum, item) => {
        const product = products.find(p => p.id === item.productId);
        return sum + ((item.unitPrice - (product?.receivedPrice || 0)) * item.returnQty);
      }, 0),
      isReturn: true,
      returnReason: returnReason
    }]);

    // Restock returned items
    setProducts(prev => 
      prev.map(product => {
        const returnItem = validReturns.find(ri => ri.productId === product.id);
        if (returnItem) {
          return { ...product, stock: product.stock + returnItem.returnQty };
        }
        return product;
      })
    );

    alert(`Return processed successfully! Refund amount: ${returnObj.totalRefund.toFixed(2)}`);
    setShowReturnModal(false);
    setReturnReason('');
  };

  // Colors for pie chart
  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4'];

  // Login screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-96 border border-white/20">
          <div className="text-center mb-8">
            <User className="w-16 h-16 text-white mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">POS System</h1>
            <p className="text-indigo-200">MobileHub Point of Sale</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={loginForm.username}
              onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-indigo-200 border border-white/30 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/50 outline-none transition-all"
            />
            <input
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-indigo-200 border border-white/30 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/50 outline-none transition-all"
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Login
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-indigo-200">
            <p>Demo accounts:</p>
            <p>admin / admin123 (Manager)</p>
            <p>cashier / cash123 (Cashier)</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleImageUpload(e, false)}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={editFileInputRef}
        onChange={(e) => handleImageUpload(e, true)}
        accept="image/*"
        className="hidden"
      />

      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <ShoppingCart className="w-8 h-8 mr-3" />
              <div>
                <h1 className="text-2xl font-bold">MobileHub POS</h1>
                <p className="text-indigo-200 text-sm">Point of Sale System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-semibold">{currentUser.username}</p>
                <p className="text-sm text-indigo-200 capitalize">{currentUser.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all duration-300 flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg min-h-screen">
          <nav className="p-6">
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('billing')}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-all duration-300 ${
                  activeTab === 'billing'
                    ? 'bg-indigo-100 text-indigo-700 border-l-4 border-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ShoppingCart className="w-5 h-5 mr-3" />
                Billing
              </button>
              
              <button
                onClick={() => setActiveTab('inventory')}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-all duration-300 ${
                  activeTab === 'inventory'
                    ? 'bg-indigo-100 text-indigo-700 border-l-4 border-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Package className="w-5 h-5 mr-3" />
                Inventory
              </button>
              
              <button
                onClick={() => setActiveTab('analytics')}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-all duration-300 ${
                  activeTab === 'analytics'
                    ? 'bg-indigo-100 text-indigo-700 border-l-4 border-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="w-5 h-5 mr-3" />
                Analytics
              </button>
              
              <button
                onClick={() => setActiveTab('sales')}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-all duration-300 ${
                  activeTab === 'sales'
                    ? 'bg-indigo-100 text-indigo-700 border-l-4 border-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Calendar className="w-5 h-5 mr-3" />
                Sales History
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Enhanced Billing Tab */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Customer Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input
                    type="text"
                    placeholder="Customer Name"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Address"
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Barcode Scanner */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <Barcode className="w-5 h-5 mr-2" />
                  Barcode Scanner
                </h2>
                <form onSubmit={handleBarcodeScan} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Scan barcode..."
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
                  >
                    Add
                  </button>
                </form>
              </div>

              {/* Category Filter */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Category Filter
                </h2>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-2 rounded-lg ${
                      selectedCategory === 'all' 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-lg capitalize ${
                        selectedCategory === category
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Product Selection */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-800">Products</h2>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => setShowCustomItemForm(true)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center"
                        >
                          <PlusCircle className="w-4 h-4 mr-2" />
                          Custom Item
                        </button>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                      {getProductsByCategory().map(product => (
                        <div
                          key={product.id}
                          onClick={() => addToCart(product)}
                          className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition-all duration-300 cursor-pointer"
                        >
                          <div className="mb-3 h-40 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                            {product.image ? (
                              <img 
                                src={product.image} 
                                alt={product.name} 
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div 
                              className={`w-full h-full flex items-center justify-center ${product.image ? 'hidden' : ''}`}
                            >
                              <Package className="w-12 h-12 text-gray-400" />
                            </div>
                          </div>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-gray-800">{product.name}</h3>
                            <span className="text-lg font-bold text-indigo-600">${product.sellingPrice}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                          <div className="flex justify-between items-center text-sm mb-2">
                            <span className="text-gray-500">SKU: {product.barcode}</span>
                            <span className="text-gray-500 capitalize">{product.category}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              product.stock > 20 ? 'bg-green-100 text-green-700' :
                              product.stock > 5 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              Stock: {product.stock}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Enhanced Cart */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Cart</h2>
                    <Receipt className="w-6 h-6 text-indigo-600" />
                  </div>
                  
                  <div className="space-y-4 max-h-64 overflow-y-auto mb-6">
                    {cart.map(item => {
                      const discountedPrice = calculateItemPrice(item);
                      return (
                        <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-800">{item.name}</h4>
                              <p className="text-sm text-gray-600">${item.sellingPrice} each</p>
                              <p className="text-xs text-gray-500">
                                {item.isCustom ? 'Custom Item' : `SKU: ${item.barcode}`}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              
                              <span className="w-8 text-center font-semibold">{item.quantity}</span>
                              
                              <button
                                onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                className="w-6 h-6 bg-indigo-200 hover:bg-indigo-300 rounded-full flex items-center justify-center transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                              
                              <button
                                onClick={() => updateCartQuantity(item.id, 0)}
                                className="ml-2 text-red-500 hover:text-red-700 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <div className="text-right ml-4">
                              <p className="font-semibold text-gray-800">
                                ${(discountedPrice * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                          
                          {/* Per-Item Discount Controls */}
                          <div className="flex items-center space-x-2 mt-2">
                            <select
                              value={item.discountType}
                              onChange={e => updateItemDiscount(item.id, item.discount, e.target.value)}
                              className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none"
                            >
                              <option value="percentage">% Discount</option>
                              <option value="fixed">$ Discount</option>
                            </select>
                            
                            <input
                              type="number"
                              placeholder="0"
                              value={item.discount}
                              onChange={e => updateItemDiscount(item.id, parseFloat(e.target.value) || 0, item.discountType)}
                              className="w-16 text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none"
                            />
                            
                            <div className="text-xs text-gray-500">
                              Discounted: ${discountedPrice.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {cart.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>Cart is empty</p>
                      </div>
                    )}
                  </div>

                  {cart.length > 0 && (
                    <div className="border-t pt-4 space-y-4">
                      {/* Global Discount Section */}
                      <div className="grid grid-cols-3 gap-2">
                        <select
                          value={discountType}
                          onChange={(e) => setDiscountType(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                        >
                          <option value="percentage">% Discount</option>
                          <option value="fixed">$ Discount</option>
                        </select>
                        <input
                          type="number"
                          placeholder="0"
                          value={discount}
                          onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                        />
                        <div className="text-sm text-gray-600 flex items-center">
                          -${getCartTotals().discountAmount.toFixed(2)}
                        </div>
                      </div>

                      {/* Notes */}
                      <textarea
                        placeholder="Bill notes (optional)"
                        value={billNotes}
                        onChange={(e) => setBillNotes(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none text-sm"
                        rows="2"
                      />

                      {/* Bill Summary */}
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal:</span>
                          <span>${getCartTotals().subtotal.toFixed(2)}</span>
                        </div>
                        {getCartTotals().discountAmount > 0 && (
                          <div className="flex justify-between text-sm text-red-600">
                            <span>Global Discount:</span>
                            <span>-${getCartTotals().discountAmount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                          <span className="text-lg font-semibold">Total:</span>
                          <span className="text-2xl font-bold text-indigo-600">
                            ${getCartTotals().total.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Expected Profit:</span>
                          <span>${getCartTotals().profit.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => printBill({
                            id: `INV-${Date.now()}`,
                            date: new Date().toISOString().split('T')[0],
                            time: new Date().toLocaleTimeString(),
                            items: cart,
                            total: getCartTotals().total,
                            profit: getCartTotals().profit,
                            customerInfo,
                            notes: billNotes,
                            cashier: currentUser.username
                          })}
                          className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center"
                        >
                          <Printer className="w-5 h-5 mr-2" />
                          Print Preview
                        </button>
                        
                        <button
                          onClick={completeSale}
                          className="bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
                        >
                          <Receipt className="w-5 h-5 mr-2" />
                          Complete Sale
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Inventory Tab */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              {/* Add Product Form */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Product</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Product Name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                  
                  <input
                    type="number"
                    placeholder="Received Price"
                    value={newProduct.receivedPrice}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, receivedPrice: e.target.value }))}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                  
                  <input
                    type="number"
                    placeholder="Selling Price"
                    value={newProduct.sellingPrice}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, sellingPrice: e.target.value }))}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                  
                  <input
                    type="number"
                    placeholder="Stock Quantity"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, stock: e.target.value }))}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                  
                  <input
                    type="text"
                    placeholder="Barcode/SKU"
                    value={newProduct.barcode}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, barcode: e.target.value }))}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                  
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-4">
                  <textarea
                    placeholder="Product Description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                    className="lg:col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                    rows="3"
                  />
                  
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="New category"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                      />
                      <button
                        onClick={addCategory}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <button
                    onClick={addProduct}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center h-fit"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </button>
                </div>

                {/* Image Upload Section */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Image
                  </label>
                  
                  {newProduct.image ? (
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="relative">
                        <img 
                          src={newProduct.image} 
                          alt="Product preview" 
                          className="w-24 h-24 object-contain border rounded-lg"
                        />
                        <button
                          onClick={() => setNewProduct(prev => ({ ...prev, image: '' }))}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => triggerImageUpload(false)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
                        disabled={uploadingImage}
                      >
                        {uploadingImage ? 'Uploading...' : 'Change Image'}
                      </button>
                    </div>
                  ) : (
                    <div 
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer hover:border-indigo-400 ${uploadingImage ? 'opacity-50' : ''}`}
                      onClick={() => !uploadingImage && triggerImageUpload(false)}
                    >
                      <Upload className={`w-12 h-12 mx-auto mb-2 text-gray-400 ${uploadingImage ? 'animate-pulse' : ''}`} />
                      <p className={`text-sm text-gray-600`}>
                        {uploadingImage ? 'Uploading image...' : 'Click to upload an image'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        JPG, PNG up to 2MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Products List */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Current Inventory</h2>
                
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Product</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Image</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">SKU</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Category</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Received Price</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Selling Price</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Stock</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Profit Margin</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {products.map(product => {
                        const isEditing = editingProductId === product.id;
                        const profitMargin = ((product.sellingPrice - product.receivedPrice) / product.receivedPrice * 100).toFixed(1);
                        
                        return (
                          <tr key={product.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editingProduct.name}
                                  onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                                  className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                />
                              ) : (
                                <div>
                                  <div className="font-medium text-gray-900">{product.name}</div>
                                  <div className="text-sm text-gray-500">{product.description}</div>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              {isEditing ? (
                                <div className="flex flex-col items-center">
                                  {editingProduct.image ? (
                                    <div className="relative mb-2">
                                      <img 
                                        src={editingProduct.image} 
                                        alt="Product preview" 
                                        className="w-16 h-16 object-contain border rounded"
                                      />
                                      <button
                                        onClick={() => setEditingProduct(prev => ({ ...prev, image: '' }))}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ) : null}
                                  
                                  <button
                                    onClick={() => triggerImageUpload(true)}
                                    className="text-sm bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded flex items-center"
                                    disabled={uploadingImage}
                                  >
                                    <Image className="w-4 h-4 mr-1" />
                                    {uploadingImage ? 'Uploading...' : (editingProduct.image ? 'Change' : 'Upload')}
                                  </button>
                                </div>
                              ) : product.image ? (
                                <img 
                                  src={product.image} 
                                  alt={product.name} 
                                  className="w-16 h-16 object-contain mx-auto"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : (
                                <div className="text-center text-gray-400">
                                  <Image className="w-8 h-8 mx-auto" />
                                  <span className="text-xs">No image</span>
                                </div>
                              )}
                              {product.image && (
                                <div className="text-center text-gray-400 hidden">
                                  <Image className="w-8 h-8 mx-auto" />
                                  <span className="text-xs">Error loading</span>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editingProduct.barcode}
                                  onChange={e => setEditingProduct({...editingProduct, barcode: e.target.value})}
                                  className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                />
                              ) : (
                                <span className="text-sm text-gray-900 font-mono">{product.barcode}</span>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              {isEditing ? (
                                <select
                                  value={editingProduct.category}
                                  onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}
                                  className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                >
                                  {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                                  ))}
                                </select>
                              ) : (
                                <span className="text-sm text-gray-900 capitalize">{product.category}</span>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={editingProduct.receivedPrice}
                                  onChange={e => setEditingProduct({...editingProduct, receivedPrice: parseFloat(e.target.value)})}
                                  className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                />
                              ) : (
                                <span className="text-sm text-gray-900">${product.receivedPrice}</span>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={editingProduct.sellingPrice}
                                  onChange={e => setEditingProduct({...editingProduct, sellingPrice: parseFloat(e.target.value)})}
                                  className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                />
                              ) : (
                                <span className="text-sm text-gray-900">${product.sellingPrice}</span>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={editingProduct.stock}
                                  onChange={e => setEditingProduct({...editingProduct, stock: parseInt(e.target.value)})}
                                  className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                />
                              ) : (
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  product.stock > 20 ? 'bg-green-100 text-green-700' :
                                  product.stock > 5 ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {product.stock}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-4 text-sm">
                              <span className={`font-semibold ${
                                profitMargin > 30 ? 'text-green-600' :
                                profitMargin > 15 ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {profitMargin}%
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm">
                              {isEditing ? (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={saveEditedProduct}
                                    className="text-green-600 hover:text-green-800"
                                  >
                                    <Save className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={cancelEditing}
                                    className="text-gray-600 hover:text-gray-800"
                                  >
                                    <X className="w-5 h-5" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => startEditing(product)}
                                  className="text-indigo-600 hover:text-indigo-800"
                                  >
                                  <Edit className="w-5 h-5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Date Range Filter for Analytics */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Analytics Dashboard</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={dateFilter.analyticsStartDate}
                      onChange={(e) => setDateFilter(prev => ({ ...prev, analyticsStartDate: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={dateFilter.analyticsEndDate}
                      onChange={(e) => setDateFilter(prev => ({ ...prev, analyticsEndDate: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Today's Sales</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${getTodaySales().reduce((sum, sale) => sum + sale.total, 0).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">{getTodaySales().length} transactions</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Today's Profit</p>
                      <p className="text-2xl font-bold text-blue-600">
                        ${getTodaySales().reduce((sum, sale) => sum + sale.profit, 0).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getTodaySales().length > 0 ? 
                          `${((getTodaySales().reduce((sum, sale) => sum + sale.profit, 0) / getTodaySales().reduce((sum, sale) => sum + sale.total, 0)) * 100).toFixed(1)}% margin` : 
                          'No sales today'
                        }
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Products</p>
                      <p className="text-2xl font-bold text-purple-600">{products.length}</p>
                      <p className="text-xs text-gray-500">{categories.length} categories</p>
                    </div>
                    <Package className="w-8 h-8 text-purple-500" />
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Low Stock Items</p>
                      <p className="text-2xl font-bold text-red-600">
                        {products.filter(p => p.stock <= 5).length}
                      </p>
                      <p className="text-xs text-gray-500">≤ 5 units remaining</p>
                    </div>
                    <TrendingDown className="w-8 h-8 text-red-500" />
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Revenue Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={getSalesChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value, name) => [`${value.toFixed(2)}`, name === 'sales' ? 'Revenue' : 'Profit']} />
                      <Line type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} name="Revenue" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Profit Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getSalesChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value.toFixed(2)}`, 'Profit']} />
                      <Bar dataKey="profit" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category Performance */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Sales by Category</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={getCategorySalesData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ category, value }) => `${category}: ${value.toFixed(0)}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="revenue"
                      >
                        {getCategorySalesData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value.toFixed(2)}`, 'Revenue']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Daily Performance Summary</h3>
                  <div className="space-y-4">
                    {getSalesChartData().slice(-5).reverse().map(day => (
                      <div key={day.date} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-semibold text-gray-800">{day.date}</p>
                          <p className="text-sm text-gray-600">{day.transactions} transactions</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">${day.sales.toFixed(2)}</p>
                          <p className="text-sm text-blue-600">Profit: ${day.profit.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sales History Tab */}
          {activeTab === 'sales' && (
            <div className="space-y-6">
              {/* Search and Date Filters */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Sales History</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search by Invoice ID, Customer..."
                      value={salesSearchTerm}
                      onChange={(e) => setSalesSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Specific Date</label>
                    <input
                      type="date"
                      value={dateFilter.selectedDate}
                      onChange={(e) => setDateFilter(prev => ({ ...prev, selectedDate: e.target.value, startDate: '', endDate: '' }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={dateFilter.startDate}
                      onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value, selectedDate: '' }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={dateFilter.endDate}
                      onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value, selectedDate: '' }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Sales List */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">
                    Sales Records ({getFilteredSales().filter(sale => 
                      sale.id.toLowerCase().includes(salesSearchTerm.toLowerCase()) ||
                      (sale.customerInfo?.name || '').toLowerCase().includes(salesSearchTerm.toLowerCase()) ||
                      (sale.customerInfo?.phone || '').includes(salesSearchTerm)
                    ).length} found)
                  </h3>
                  <div className="text-lg font-semibold text-green-600">
                    Total: ${getFilteredSales().filter(sale => 
                      sale.id.toLowerCase().includes(salesSearchTerm.toLowerCase()) ||
                      (sale.customerInfo?.name || '').toLowerCase().includes(salesSearchTerm.toLowerCase()) ||
                      (sale.customerInfo?.phone || '').includes(salesSearchTerm)
                    ).reduce((sum, sale) => sum + sale.total, 0).toFixed(2)}
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Invoice ID</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Date & Time</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Customer</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Items</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Total</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Profit</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {getFilteredSales().filter(sale => 
                        sale.id.toLowerCase().includes(salesSearchTerm.toLowerCase()) ||
                        (sale.customerInfo?.name || '').toLowerCase().includes(salesSearchTerm.toLowerCase()) ||
                        (sale.customerInfo?.phone || '').includes(salesSearchTerm)
                      ).map(sale => (
                        <tr key={sale.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 text-sm font-medium text-gray-900 font-mono">
                            {sale.isReturn && <span className="text-red-600 text-xs">RETURN </span>}
                            {sale.id}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            <div>{new Date(sale.date).toLocaleDateString()}</div>
                            {sale.time && <div className="text-xs text-gray-500">{sale.time}</div>}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            <div>{sale.customerInfo?.name || 'Walk-in Customer'}</div>
                            {sale.customerInfo?.phone && (
                              <div className="text-xs text-gray-500">{sale.customerInfo.phone}</div>
                            )}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            {sale.items.reduce((sum, item) => sum + item.quantity, 0)} items
                          </td>
                          <td className={`px-4 py-4 text-sm font-semibold ${sale.total < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            ${Math.abs(sale.total).toFixed(2)}
                          </td>
                          <td className={`px-4 py-4 text-sm font-semibold ${sale.profit < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                            ${Math.abs(sale.profit).toFixed(2)}
                          </td>
                          <td className="px-4 py-4 text-sm">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => downloadBillPDF(sale)}
                                className="text-indigo-600 hover:text-indigo-800 flex items-center"
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Bill
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedSale(sale);
                                  setShowSaleDetails(true);
                                }}
                                className="text-gray-600 hover:text-gray-800 flex items-center"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Details
                              </button>
                              {!sale.isReturn && (
                                <button 
                                  onClick={() => initReturn(sale)}
                                  className="text-red-600 hover:text-red-800 flex items-center"
                              >
                                  <RefreshCw className="w-4 h-4 mr-1" />
                                  Return
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {getFilteredSales().filter(sale => 
                    sale.id.toLowerCase().includes(salesSearchTerm.toLowerCase()) ||
                    (sale.customerInfo?.name || '').toLowerCase().includes(salesSearchTerm.toLowerCase()) ||
                    (sale.customerInfo?.phone || '').includes(salesSearchTerm)
                  ).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No sales found for the current filters</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Custom Item Modal */}
      {showCustomItemForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 max-w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Add Custom Item</h3>
              <button
                onClick={() => setShowCustomItemForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Item Name"
                value={customItem.name}
                onChange={(e) => setCustomItem(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
              
              <input
                type="number"
                placeholder="Price"
                value={customItem.price}
                onChange={(e) => setCustomItem(prev => ({ ...prev, price: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
              
              <input
                type="number"
                placeholder="Quantity"
                value={customItem.quantity}
                onChange={(e) => setCustomItem(prev => ({ ...prev, quantity: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
              
              <textarea
                placeholder="Description (optional)"
                value={customItem.description}
                onChange={(e) => setCustomItem(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                rows="3"
              />
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCustomItemForm(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addCustomItemToCart}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sale Details Modal */}
      {showSaleDetails && selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                {selectedSale.isReturn ? 'Return Details' : 'Sale Details'} - {selectedSale.id}
              </h3>
              <button
                onClick={() => setShowSaleDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Sale Information */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <Receipt className="w-5 h-5 mr-2" />
                    {selectedSale.isReturn ? 'Return' : 'Sale'} Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Invoice ID:</span>
                      <span className="font-mono font-semibold">{selectedSale.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span>{new Date(selectedSale.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span>{selectedSale.time || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cashier:</span>
                      <span className="capitalize">{selectedSale.cashier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Items:</span>
                      <span>{selectedSale.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                    </div>
                    {selectedSale.returnReason && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Return Reason:</span>
                        <span>{selectedSale.returnReason}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Customer Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span>{selectedSale.customerInfo?.name || 'Walk-in Customer'}</span>
                    </div>
                    {selectedSale.customerInfo?.phone && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span>{selectedSale.customerInfo.phone}</span>
                      </div>
                    )}
                    {selectedSale.customerInfo?.email && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span>{selectedSale.customerInfo.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Financial Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>${Math.abs(selectedSale.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>{selectedSale.isReturn ? 'Refund:' : 'Total:'}</span>
                      <span className={selectedSale.isReturn ? 'text-red-600' : 'text-green-600'}>
                        ${Math.abs(selectedSale.total).toFixed(2)}
                      </span>
                    </div>
                    <div className={`flex justify-between ${selectedSale.isReturn ? 'text-red-600' : 'text-blue-600'}`}>
                      <span>{selectedSale.isReturn ? 'Loss:' : 'Profit:'}</span>
                      <span>${Math.abs(selectedSale.profit).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {selectedSale.notes && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Notes</h4>
                    <p className="text-sm text-gray-700">{selectedSale.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Items List */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Items {selectedSale.isReturn ? 'Returned' : 'Sold'}
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full table-auto border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Product</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Unit Price</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Quantity</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedSale.items.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">
                          <div className="font-medium text-gray-900">{item.productName}</div>
                          {item.isCustom && <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">Custom Item</span>}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">${item.unitPrice.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                          ${(item.unitPrice * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowSaleDetails(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => downloadBillPDF(selectedSale)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Bill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {showReturnModal && saleToReturn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                Process Return - {saleToReturn.id}
              </h3>
              <button onClick={() => setShowReturnModal(false)}>
                <X className="w-6 h-6 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-4">Select Items to Return</h4>
              <table className="w-full table-auto border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">Product</th>
                    <th className="px-4 py-3 text-left">Original Qty</th>
                    <th className="px-4 py-3 text-left">Return Qty</th>
                    <th className="px-4 py-3 text-left">Unit Price</th>
                    <th className="px-4 py-3 text-left">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {returnItems.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3">{item.productName}</td>
                      <td className="px-4 py-3">{item.quantity}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <button 
                            onClick={() => updateReturnQty(index, Math.max(0, item.returnQty - 1))}
                            className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="mx-2 w-8 text-center">{item.returnQty}</span>
                          <button 
                            onClick={() => updateReturnQty(index, Math.min(item.quantity, item.returnQty + 1))}
                            className="w-6 h-6 bg-indigo-200 rounded-full flex items-center justify-center hover:bg-indigo-300"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">${item.unitPrice.toFixed(2)}</td>
                      <td className="px-4 py-3 font-medium">
                        ${(item.returnQty * item.unitPrice).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="4" className="px-4 py-3 text-right font-semibold">Total Refund:</td>
                    <td className="px-4 py-3 font-bold text-red-600">
                      ${returnItems.reduce((sum, item) => sum + (item.returnQty * item.unitPrice), 0).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div className="mb-6">
              <label className="block font-medium text-gray-700 mb-2">
                Reason for Return
              </label>
              <textarea
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                rows="3"
                placeholder="Enter reason for return..."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowReturnModal(false)}
                className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={processReturn}
                disabled={returnItems.filter(item => item.returnQty > 0).length === 0}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Process Return
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Progress Indicator */}
      {uploadingImage && (
        <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 flex items-center">
          <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mr-3"></div>
          <span className="text-gray-700">
            Uploading... {uploadProgress}%
          </span>
        </div>
      )}
    </div>
  );
};

export default POSSystem;