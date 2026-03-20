import React, { useState, useEffect, useContext } from 'react';
import { POSProvider, POSContext } from './context/POSContext';
import Toast from './components/Toast';
import Billing from './components/Billing';
import Inventory from './components/Inventory';
import Analytics from './components/Analytics';
import SalesHistory from './components/SalesHistory';
import { ShoppingCart, LogOut, Package, BarChart3, Calendar, Moon, Sun, Loader2 } from 'lucide-react';
import api from './api';
import { getOfflineSales, removeOfflineSale } from './utils/db'; // 💡 PWA Offline DB Imports

const AppContent = () => {
  
  const { showAlert, fetchProducts, fetchCategories, fetchSales, isProcessing } = useContext(POSContext);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [isProcessingLogin, setIsProcessingLogin] = useState(false);

  const [activeTab, setActiveTab] = useState('billing');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (userJson && token && userJson !== "undefined" && userJson !== "null") {
      try {
        setCurrentUser(JSON.parse(userJson));
        setIsLoggedIn(true);
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  // Idle Timer for Security
  useEffect(() => {
    let idleTimer;
    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        if (localStorage.getItem('token')) {
          handleLogout(true); 
        }
      }, 15 * 60 * 1000); 
    };

    if (isLoggedIn) {
      window.addEventListener('mousemove', resetIdleTimer);
      window.addEventListener('keydown', resetIdleTimer);
      window.addEventListener('click', resetIdleTimer);
      window.addEventListener('scroll', resetIdleTimer);
      resetIdleTimer();
    }

    return () => {
      window.removeEventListener('mousemove', resetIdleTimer);
      window.removeEventListener('keydown', resetIdleTimer);
      window.removeEventListener('click', resetIdleTimer);
      window.removeEventListener('scroll', resetIdleTimer);
      clearTimeout(idleTimer);
    };
  }, [isLoggedIn]);

  
  useEffect(() => {
    const syncOfflineData = async () => {
      try {
        const offlineSales = await getOfflineSales();
        if (offlineSales && offlineSales.length > 0) {
          showAlert(`Syncing ${offlineSales.length} offline sales to server...`, 'info');
          let successCount = 0;
          
          for (const sale of offlineSales) {
            try {
              
              const { localId, savedAt, ...backendPayload } = sale;
              await api.createSale(backendPayload);
              await removeOfflineSale(localId); 
              successCount++;
            } catch (error) {
              console.error("Failed to sync a sale", error);
            }
          }
          
          if (successCount > 0) {
            showAlert(`Successfully synced ${successCount} sales!`, 'success');
            fetchSales(); // Update sales history
            fetchProducts(); // Update stock
          }
        }
      } catch (err) {
        console.error("Offline DB Sync Error:", err);
      }
    };

    
    window.addEventListener('online', syncOfflineData);
    
    
    if (isLoggedIn && navigator.onLine) {
      syncOfflineData();
    }

    return () => window.removeEventListener('online', syncOfflineData);
  }, [isLoggedIn]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsProcessingLogin(true);
    try {
      const response = await api.login(loginForm);
      const userData = { 
        id: response.data.id, 
        username: response.data.username, 
        name: response.data.name, 
        role: response.data.role 
      };
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(userData));
      setCurrentUser(userData);
      setIsLoggedIn(true);
      setLoginForm({ username: '', password: '' });
      showAlert('Login successful!', 'success');
      
      // Load initial data
      fetchCategories();
      fetchProducts();
      fetchSales();

    } catch (error) {
      showAlert(error.response?.data?.message || 'Invalid credentials', 'error');
    } finally {
      setIsProcessingLogin(false);
    }
  };

  const handleLogout = async (isAuto = false) => {
    try { await api.logout(); } catch (err) {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setIsLoggedIn(false);
    if(isAuto) showAlert("Session expired. Please login again.", 'info');
  };

  const userRole = String(currentUser?.role || '').toUpperCase();
  const isAdmin = userRole === 'ADMIN' || userRole === 'MANAGER';

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  // LOGIN SCREEN
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center relative p-4">
        <Toast />
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-sm border border-white/20 relative shadow-2xl">
          {isProcessingLogin && (
             <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-50">
                <Loader2 className="w-10 h-10 text-white animate-spin mb-2" />
                <p className="text-white font-medium">Signing in...</p>
             </div>
          )}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30 shadow-inner">
               <ShoppingCart className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">MobileHub</h1>
            <p className="text-indigo-200 font-medium">POS System Login</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <input type="text" placeholder="Username" value={loginForm.username} onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))} disabled={isProcessingLogin} className="w-full px-5 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white placeholder-indigo-200 border border-white/30 outline-none focus:ring-2 focus:ring-white/50" />
            <input type="password" placeholder="Password" value={loginForm.password} onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))} disabled={isProcessingLogin} className="w-full px-5 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white placeholder-indigo-200 border border-white/30 outline-none focus:ring-2 focus:ring-white/50" />
            <button type="submit" disabled={isProcessingLogin || !loginForm.username || !loginForm.password} className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3.5 rounded-xl font-bold text-lg disabled:opacity-50 hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/20">Access System</button>
          </form>
        </div>
      </div>
    );
  }

  // MAIN DASHBOARD
  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
      <Toast />

      {/* 💡 FULL SCREEN LOADING OVERLAY */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex flex-col items-center justify-center text-white">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-20 h-20 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
            <Loader2 className="w-10 h-10 animate-spin text-white" />
          </div>
          <p className="mt-6 text-xl font-bold tracking-[0.2em] animate-pulse uppercase">
            {activeTab === 'billing' ? 'Processing Sale...' : 'Updating System...'}
          </p>
        </div>
      )}
      
      <header className="bg-indigo-600 text-white p-4 flex justify-between items-center shadow-lg z-10">
        <h1 className="text-xl md:text-2xl font-bold flex items-center"><ShoppingCart className="mr-2"/> MobileHub POS</h1>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 bg-indigo-500 rounded-full hover:bg-indigo-700 transition-colors shadow-inner" title="Toggle Theme">
            {isDarkMode ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}
          </button>
          <div className="hidden md:flex flex-col text-right text-sm">
            <span className="font-bold">{currentUser?.name || currentUser?.username}</span>
            <span className="text-indigo-200 text-xs uppercase tracking-wider">{currentUser?.role}</span>
          </div>
          <button onClick={() => handleLogout(false)} className="flex items-center bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-all active:scale-95"><LogOut className="w-4 h-4 md:mr-2"/> <span className="hidden md:inline">Logout</span></button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        <aside className={`md:w-64 shadow-2xl flex md:flex-col overflow-x-auto md:overflow-y-auto z-0 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="p-2 md:p-4 flex md:flex-col gap-2 flex-1">
            <button onClick={() => setActiveTab('billing')} className={`w-full text-left p-4 rounded-xl flex items-center whitespace-nowrap transition-all ${activeTab==='billing' ? 'bg-indigo-500 text-white font-bold shadow-lg transform scale-105 md:scale-100' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}><ShoppingCart className="w-5 h-5 md:mr-3"/> <span className="hidden md:inline">Billing</span></button>
            {isAdmin && (
              <>
                <button onClick={() => setActiveTab('inventory')} className={`w-full text-left p-4 rounded-xl flex items-center whitespace-nowrap transition-all ${activeTab==='inventory' ? 'bg-indigo-500 text-white font-bold shadow-lg transform scale-105 md:scale-100' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}><Package className="w-5 h-5 md:mr-3"/> <span className="hidden md:inline">Inventory</span></button>
                <button onClick={() => setActiveTab('analytics')} className={`w-full text-left p-4 rounded-xl flex items-center whitespace-nowrap transition-all ${activeTab==='analytics' ? 'bg-indigo-500 text-white font-bold shadow-lg transform scale-105 md:scale-100' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}><BarChart3 className="w-5 h-5 md:mr-3"/> <span className="hidden md:inline">Analytics</span></button>
              </>
            )}
            <button onClick={() => setActiveTab('sales')} className={`w-full text-left p-4 rounded-xl flex items-center whitespace-nowrap transition-all ${activeTab==='sales' ? 'bg-indigo-500 text-white font-bold shadow-lg transform scale-105 md:scale-100' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}><Calendar className="w-5 h-5 md:mr-3"/> <span className="hidden md:inline">Sales History</span></button>
          </div>
        </aside>

        <main className={`flex-1 p-4 md:p-6 overflow-y-auto ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
          {activeTab === 'billing' && <Billing isDarkMode={isDarkMode} />}
          {activeTab === 'inventory' && isAdmin && <Inventory isDarkMode={isDarkMode} />}
          {activeTab === 'analytics' && isAdmin && <Analytics isDarkMode={isDarkMode} />}
          {activeTab === 'sales' && <SalesHistory isDarkMode={isDarkMode} />}
        </main>
      </div>
    </div>
  );
};

const App = () => (
  <POSProvider>
    <AppContent />
  </POSProvider>
);

export default App;