
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
  TrendingDown
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Shared database with the e-commerce site
const DATABASE = {
  products: [
    {
      id: 1,
      name: "iPhone 15 Pro",
      receivedPrice: 850,
      sellingPrice: 999,
      description: "Latest iPhone with titanium build and A17 Pro chip",
      stock: 25,
      category: "phone"
    },
    {
      id: 2,
      name: "Samsung Galaxy S24",
      receivedPrice: 750,
      sellingPrice: 899,
      description: "Flagship Android phone with AI features",
      stock: 30,
      category: "phone"
    },
    {
      id: 3,
      name: "AirPods Pro 2",
      receivedPrice: 180,
      sellingPrice: 249,
      description: "Wireless earbuds with active noise cancellation",
      stock: 50,
      category: "accessory"
    },
    {
      id: 4,
      name: "Fast Wireless Charger",
      receivedPrice: 25,
      sellingPrice: 39,
      description: "15W fast wireless charging pad",
      stock: 75,
      category: "accessory"
    },
    {
      id: 5,
      name: "MagSafe Phone Case",
      receivedPrice: 15,
      sellingPrice: 29,
      description: "Premium protective case with MagSafe",
      stock: 100,
      category: "accessory"
    }
  ],
  sales: [
    { id: 1, date: '2024-08-01', items: [{ productId: 1, quantity: 2, unitPrice: 999 }], total: 1998, profit: 298 },
    { id: 2, date: '2024-08-02', items: [{ productId: 3, quantity: 1, unitPrice: 249 }], total: 249, profit: 69 },
    { id: 3, date: '2024-08-03', items: [{ productId: 2, quantity: 1, unitPrice: 899 }, { productId: 4, quantity: 2, unitPrice: 39 }], total: 977, profit: 177 },
    { id: 4, date: '2024-08-04', items: [{ productId: 5, quantity: 3, unitPrice: 29 }], total: 87, profit: 42 },
    { id: 5, date: '2024-08-05', items: [{ productId: 1, quantity: 1, unitPrice: 999 }], total: 999, profit: 149 },
    { id: 6, date: '2024-08-06', items: [{ productId: 3, quantity: 2, unitPrice: 249 }], total: 498, profit: 138 },
    { id: 7, date: '2024-08-07', items: [{ productId: 2, quantity: 1, unitPrice: 899 }, { productId: 5, quantity: 1, unitPrice: 29 }], total: 928, profit: 163 },
    { id: 8, date: '2024-08-08', items: [{ productId: 4, quantity: 4, unitPrice: 39 }], total: 156, profit: 56 },
    { id: 9, date: '2024-08-09', items: [{ productId: 1, quantity: 1, unitPrice: 999 }, { productId: 3, quantity: 1, unitPrice: 249 }], total: 1248, profit: 218 },
    { id: 10, date: '2024-08-10', items: [{ productId: 2, quantity: 2, unitPrice: 899 }], total: 1798, profit: 298 }
  ],
  users: [
    { id: 1, username: 'admin', password: 'admin123', role: 'manager' },
    { id: 2, username: 'cashier', password: 'cash123', role: 'cashier' }
  ]
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
  const [searchTerm, setSearchTerm] = useState('');
  
  // Product management state
  const [newProduct, setNewProduct] = useState({
    name: '',
    receivedPrice: '',
    sellingPrice: '',
    description: '',
    stock: '',
    category: 'phone'
  });

  // Date filter state
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: '',
    selectedDate: new Date().toISOString().split('T')[0]
  });

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
      return [...prev, { ...product, quantity: 1 }];
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

  // Complete sale
  const completeSale = () => {
    if (cart.length === 0) return;

    const total = cart.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
    const totalCost = cart.reduce((sum, item) => sum + (item.receivedPrice * item.quantity), 0);
    const profit = total - totalCost;

    const newSale = {
      id: sales.length + 1,
      date: new Date().toISOString().split('T')[0],
      items: cart.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        unitPrice: item.sellingPrice
      })),
      total,
      profit
    };

    setSales(prev => [...prev, newSale]);
    
    // Update stock
    setProducts(prev =>
      prev.map(product => {
        const cartItem = cart.find(item => item.id === product.id);
        if (cartItem) {
          return { ...product, stock: product.stock - cartItem.quantity };
        }
        return product;
      })
    );

    setCart([]);
    alert(`Sale completed! Total: $${total.toFixed(2)}`);
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
      stock: parseInt(newProduct.stock) || 0
    };

    setProducts(prev => [...prev, product]);
    setNewProduct({
      name: '',
      receivedPrice: '',
      sellingPrice: '',
      description: '',
      stock: '',
      category: 'phone'
    });
    alert('Product added successfully!');
  };

  // Filter products for search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get sales data for charts
  const getSalesChartData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const daySales = sales.filter(sale => sale.date === date);
      const total = daySales.reduce((sum, sale) => sum + sale.total, 0);
      const profit = daySales.reduce((sum, sale) => sum + sale.profit, 0);
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sales: total,
        profit: profit
      };
    });
  };

  // Get today's sales
  const getTodaySales = () => {
    const today = new Date().toISOString().split('T')[0];
    return sales.filter(sale => sale.date === today);
  };

  // Get filtered sales by date range
  const getFilteredSales = () => {
    let filtered = sales;

    if (dateFilter.selectedDate) {
      filtered = filtered.filter(sale => sale.date === dateFilter.selectedDate);
    }

    if (dateFilter.startDate && dateFilter.endDate) {
      filtered = filtered.filter(sale => 
        sale.date >= dateFilter.startDate && sale.date <= dateFilter.endDate
      );
    }

    return filtered;
  };

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
          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Product Selection */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Products</h2>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      />
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
                        <div className="flex justify-between items-center text-sm">
                          <span className={`px-2 py-1 rounded ${
                            product.stock > 20 ? 'bg-green-100 text-green-700' :
                            product.stock > 5 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            Stock: {product.stock}
                          </span>
                          <span className="text-gray-500 capitalize">{product.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cart */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Cart</h2>
                
                <div className="space-y-4 max-h-64 overflow-y-auto mb-6">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{item.name}</h4>
                        <p className="text-sm text-gray-600">${item.sellingPrice} each</p>
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
                    </div>
                  ))}
                  
                  {cart.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>Cart is empty</p>
                    </div>
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-2xl font-bold text-indigo-600">
                        ${cart.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0).toFixed(2)}
                      </span>
                    </div>
                    
                    <button
                      onClick={completeSale}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      Complete Sale
                    </button>
                  </div>
                )}
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
                  
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  >
                    <option value="phone">Phone</option>
                    <option value="accessory">Accessory</option>
                  </select>
                  
                  <button
                    onClick={addProduct}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </button>
                </div>
                
                <textarea
                  placeholder="Product Description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                  rows="3"
                />
              </div>

              {/* Products List */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Current Inventory</h2>
                
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Product</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Category</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Received Price</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Selling Price</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Stock</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Profit Margin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {products.map(product => {
                        const profitMargin = ((product.sellingPrice - product.receivedPrice) / product.receivedPrice * 100).toFixed(1);
                        return (
                          <tr key={product.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4">
                              <div>
                                <div className="font-medium text-gray-900">{product.name}</div>
                                <div className="text-sm text-gray-500">{product.description}</div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-900 capitalize">{product.category}</td>
                            <td className="px-4 py-4 text-sm text-gray-900">${product.receivedPrice}</td>
                            <td className="px-4 py-4 text-sm text-gray-900">${product.sellingPrice}</td>
                            <td className="px-4 py-4">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                product.stock > 20 ? 'bg-green-100 text-green-700' :
                                product.stock > 5 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {product.stock}
                              </span>
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
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Today's Sales</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${getTodaySales().reduce((sum, sale) => sum + sale.total, 0).toFixed(2)}
                      </p>
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
                    </div>
                    <DollarSign className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Products</p>
                      <p className="text-2xl font-bold text-purple-600">{products.length}</p>
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
                    </div>
                    <TrendingDown className="w-8 h-8 text-red-500" />
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Sales Trend (Last 7 Days)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={getSalesChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Profit Trend (Last 7 Days)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getSalesChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="profit" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Sales History Tab */}
          {activeTab === 'sales' && (
            <div className="space-y-6">
              {/* Date Filters */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Sales History</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Specific Date</label>
                    <input
                      type="date"
                      value={dateFilter.selectedDate}
                      onChange={(e) => setDateFilter(prev => ({ ...prev, selectedDate: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={dateFilter.startDate}
                      onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={dateFilter.endDate}
                      onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Sales List */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">
                    Sales Records ({getFilteredSales().length} transactions)
                  </h3>
                  <div className="text-lg font-semibold text-green-600">
                    Total: ${getFilteredSales().reduce((sum, sale) => sum + sale.total, 0).toFixed(2)}
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Sale ID</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Items</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Total</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Profit</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {getFilteredSales().map(sale => (
                        <tr key={sale.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 text-sm font-medium text-gray-900">#{sale.id}</td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            {new Date(sale.date).toLocaleDateString()}
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
                            <button className="text-indigo-600 hover:text-indigo-800 flex items-center">
                              <Eye className="w-4 h-4 mr-1" />
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {getFilteredSales().length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No sales found for the selected date range</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default POSSystem;