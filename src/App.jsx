import { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  DollarSign, 
  Package, 
  BarChart3, 
  Calendar, 
  User, 
  LogOut, 
  Search,
  Eye,
  TrendingUp,
  TrendingDown,
  Download,
  Receipt,
  Phone,
  MapPin,
  Mail,
  Clock,
  X,
  Edit,
  Save,
  PlusCircle,
  Filter
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// Enhanced database with more sample data
const DATABASE = {
  products: [
    {
      id: 1,
      name: "iPhone 15 Pro",
      receivedPrice: 850,
      sellingPrice: 999,
      description: "Latest iPhone with titanium build and A17 Pro chip",
      stock: 25,
      category: "smartphones",
      barcode: "1234567890123"
    },
    {
      id: 2,
      name: "Samsung Galaxy S24",
      receivedPrice: 750,
      sellingPrice: 899,
      description: "Flagship Android phone with AI features",
      stock: 30,
      category: "smartphones",
      barcode: "2345678901234"
    },
    {
      id: 3,
      name: "AirPods Pro 2",
      receivedPrice: 180,
      sellingPrice: 249,
      description: "Wireless earbuds with active noise cancellation",
      stock: 50,
      category: "audio",
      barcode: "3456789012345"
    },
    {
      id: 4,
      name: "Fast Wireless Charger",
      receivedPrice: 25,
      sellingPrice: 39,
      description: "15W fast wireless charging pad",
      stock: 75,
      category: "chargers",
      barcode: "4567890123456"
    },
    {
      id: 5,
      name: "MagSafe Phone Case",
      receivedPrice: 15,
      sellingPrice: 29,
      description: "Premium protective case with MagSafe",
      stock: 100,
      category: "cases",
      barcode: "5678901234567"
    }
  ],
  sales: [
    { 
      id: 'INV-001', 
      date: '2024-08-01', 
      time: '10:30:00',
      items: [{ productId: 1, productName: 'iPhone 15 Pro', quantity: 2, unitPrice: 999 }], 
      total: 1998, 
      profit: 298, 
      discount: 0,
      discountType: 'percentage',
      customerInfo: { name: 'John Doe', phone: '123-456-7890', email: 'john@email.com' },
      notes: 'Customer requested expedited service',
      cashier: 'admin'
    },
    { 
      id: 'INV-002', 
      date: '2024-08-02', 
      time: '14:15:00',
      items: [{ productId: 3, productName: 'AirPods Pro 2', quantity: 1, unitPrice: 249 }], 
      total: 224.1, 
      profit: 44.1, 
      discount: 10,
      discountType: 'percentage',
      customerInfo: { name: 'Jane Smith', phone: '234-567-8901' },
      notes: '',
      cashier: 'cashier'
    },
    { 
      id: 'INV-003', 
      date: '2024-08-03', 
      time: '16:45:00',
      items: [
        { productId: 2, productName: 'Samsung Galaxy S24', quantity: 1, unitPrice: 899 }, 
        { productId: 4, productName: 'Fast Wireless Charger', quantity: 2, unitPrice: 39 }
      ], 
      total: 977, 
      profit: 177, 
      discount: 0,
      discountType: 'percentage',
      customerInfo: { name: 'Mike Johnson', phone: '345-678-9012' },
      notes: 'Bundle discount applied',
      cashier: 'admin'
    }
  ],
  users: [
    { id: 1, username: 'admin', password: 'admin123', role: 'manager' },
    { id: 2, username: 'cashier', password: 'cash123', role: 'cashier' }
  ],
  categories: ['smartphones', 'audio', 'chargers', 'cases', 'tablets', 'smartwatches', 'cables'],
  storeInfo: {
    name: 'MobileHub',
    tagline: 'Your Mobile Technology Partner',
    address: '123 Tech Street, Digital City, DC 12345',
    phone: '+1 (555) 123-4567',
    email: 'info@mobilehub.com',
    website: 'www.mobilehub.com',
    taxId: 'TAX-123456789'
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
    barcode: ''
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
      receivedPrice: 0, // Custom items have no cost
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
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
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
    
    // Update stock for non-custom items
    setProducts(prev =>
      prev.map(product => {
        const cartItem = cart.find(item => item.id === product.id && !item.isCustom);
        if (cartItem) {
          return { ...product, stock: product.stock - cartItem.quantity };
        }
        return product;
      })
    );

    // Generate and download PDF
    downloadBillPDF(newSale);

    // Reset form
    setCart([]);
    setCustomerInfo({ name: '', phone: '', email: '', address: '' });
    setBillNotes('');
    setDiscount(0);
    
    alert(`Sale completed! Total: $${total.toFixed(2)}\nBill downloaded as HTML file.`);
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
      barcode: ''
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
    
    setProducts(prev =>
      prev.map(p => 
        p.id === editingProductId ? editingProduct : p
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
      // Default to last 7 days
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
                      {filteredProducts.map(product => (
                        <div
                          key={product.id}
                          onClick={() => addToCart(product)}
                          className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition-all duration-300 cursor-pointer"
                        >
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

                {/* Enhanced Cart with Bill Preview and Per-Item Discounts */}
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
                      
                      <button
                        onClick={completeSale}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
                      >
                        <Receipt className="w-5 h-5 mr-2" />
                        Complete Sale & Print Bill
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Inventory Tab with Editing Functionality */}
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
              </div>

              {/* Products List with Edit Functionality */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Current Inventory</h2>
                
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Product</th>
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
                                  onChange={e => setEditingProduct({...editingProduct, receivedPrice: e.target.value})}
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
                                  onChange={e => setEditingProduct({...editingProduct, sellingPrice: e.target.value})}
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
                                  onChange={e => setEditingProduct({...editingProduct, stock: e.target.value})}
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

          {/* Enhanced Analytics Tab */}
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

              {/* Category Performance and Daily Summary */}
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

              {/* Period Summary */}
              {(dateFilter.analyticsStartDate && dateFilter.analyticsEndDate) && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Period Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">
                        ${getSalesChartData().reduce((sum, day) => sum + day.sales, 0).toFixed(2)}
                      </p>
                      <p className="text-gray-600">Total Revenue</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600">
                        ${getSalesChartData().reduce((sum, day) => sum + day.profit, 0).toFixed(2)}
                      </p>
                      <p className="text-gray-600">Total Profit</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-purple-600">
                        ${(getSalesChartData().reduce((sum, day) => sum + day.sales, 0) / getSalesChartData().length).toFixed(2)}
                      </p>
                      <p className="text-gray-600">Daily Average</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Enhanced Sales History Tab */}
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
                          <td className="px-4 py-4 text-sm font-medium text-gray-900 font-mono">{sale.id}</td>
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
                          <td className="px-4 py-4 text-sm font-semibold text-green-600">
                            ${sale.total.toFixed(2)}
                          </td>
                          <td className="px-4 py-4 text-sm font-semibold text-blue-600">
                            ${sale.profit.toFixed(2)}
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
              <h3 className="text-2xl font-bold text-gray-800">Sale Details - {selectedSale.id}</h3>
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
                    Sale Information
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
                    {selectedSale.customerInfo?.address && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Address:</span>
                        <span>{selectedSale.customerInfo.address}</span>
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
                      <span>${selectedSale.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0).toFixed(2)}</span>
                    </div>
                    {selectedSale.discount > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Global Discount (${selectedSale.discountType === 'percentage' ? selectedSale.discount + '%' : 
                 + selectedSale.discount}):</span>
                        <span>-${(selectedSale.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0) - selectedSale.total).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span className="text-green-600">${selectedSale.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-blue-600">
                      <span>Profit:</span>
                      <span>${selectedSale.profit.toFixed(2)}</span>
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
                Items Sold
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full table-auto border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Product</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Unit Price</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Discount</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Discounted Price</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Quantity</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedSale.items.map((item, index) => {
                      const discountedPrice = item.discountType === 'percentage' 
                        ? item.unitPrice * (1 - item.discount / 100)
                        : Math.max(0, item.unitPrice - item.discount);
                        
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">
                            <div className="font-medium text-gray-900">{item.productName}</div>
                            {item.isCustom && <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">Custom Item</span>}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">${item.unitPrice.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {item.discount > 0 
                              ? `${item.discount}${item.discountType === 'percentage' ? '%' : '$'}` 
                              : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">${discountedPrice.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                            ${(discountedPrice * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
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
    </div>
  );
};

export default POSSystem;