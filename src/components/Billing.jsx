import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { POSContext } from '../context/POSContext';
import { ShoppingCart, Plus, Minus, Trash2, Printer, Receipt, User, Barcode, Filter, PlusCircle, X, Package, Loader2, WifiOff, CloudOff, RefreshCw } from 'lucide-react';
import { generateBillHTML, printIframe, downloadPDF } from '../utils/receiptUtils';
import api from '../api';
import { saveSaleOffline, getOfflineSales, removeOfflineSale, updateOfflineStock } from '../utils/db';

const Billing = ({ isDarkMode }) => {
  const { 
    products, setProducts, categories, showAlert, isProcessing, setIsProcessing, storeInfo, fetchProducts,
    cart, setCart, customerInfo, setCustomerInfo, billNotes, setBillNotes,
    discount, setDiscount, discountType, setDiscountType
  } = useContext(POSContext);

  const barcodeRef = useRef(null); 
  const [barcodeInput, setBarcodeInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const [showCustomItemForm, setShowCustomItemForm] = useState(false);
  const [customItem, setCustomItem] = useState({ name: '', price: '', quantity: 1, description: '' });

  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [unsyncedCount, setUnsyncedCount] = useState(0); 
  const [isSyncing, setIsSyncing] = useState(false);

  // Offline බිල් කීයක් තියෙනවද කියලා බලන Function එක
  const checkUnsyncedSales = async () => {
    try {
      const offlineSales = await getOfflineSales();
      setUnsyncedCount(offlineSales.length);
    } catch (error) {
      console.error("Error checking offline sales:", error);
    }
  };

  useEffect(() => {
    checkUnsyncedSales();
  }, []);

 
  const syncOfflineSales = useCallback(async () => {
    try {
      const offlineSales = await getOfflineSales();
      if (offlineSales.length === 0) return;

      setIsSyncing(true);
      let syncCount = 0;

      for (const sale of offlineSales) {
        try {
          const { localId, savedAt, ...salePayload } = sale;
          await api.createSale(salePayload);
          
          // සාර්ථකව සේව් වුණොත් පමණක් මකයි
          await removeOfflineSale(localId);
          syncCount++;
        } catch (err) {
          console.error('Failed to sync an offline sale:', err);
          
          const errMsg = err.response?.data?.message?.toLowerCase() || '';
          
          // මෙතනින් status === 400 කියන එක අයින් කළා!
          // දැන් මකන්නේ Backend එකෙන් "Duplicate / Already exists" කියලා කිව්වොත් විතරයි.
          if (errMsg.includes('duplicate') || errMsg.includes('already exists')) {
             console.warn(`Removing duplicate offline sale (Invoice: ${sale.invoiceId})`);
             await removeOfflineSale(sale.localId);
          } else {
             // 400 Bad Request, 500 Server Error, Network Down මොක ආවත් බිල් එක Local DB එකේ සුරක්ෂිතව තියාගන්නවා.
             console.error(`Keeping Sale ${sale.invoiceId} in local DB to prevent data loss.`);
          }
        }
      }

      if (syncCount > 0) {
        showAlert(`Successfully synced ${syncCount} offline sales!`, 'success');
        if (navigator.onLine) await fetchProducts(); 
      }
    } catch (error) {
      console.error("Error during auto-sync:", error);
    } finally {
      setIsSyncing(false);
      checkUnsyncedSales(); 
    }
  }, [fetchProducts, showAlert]);

  // Data On/Off වෙන එක ඒ වෙලාවෙම අල්ලගන්න Effect එක (අලුත් කරන ලදි: Polling මගින්)
  useEffect(() => {
    let wasOffline = !navigator.onLine;

    const checkNetworkStatus = () => {
      const isNowOffline = !navigator.onLine;
      
      // Offline ඉඳලා Online ආවා නම්
      if (wasOffline && !isNowOffline) {
        setIsOffline(false);
        syncOfflineSales(); 
      } 
      // Online ඉඳලා Offline ගියා නම්
      else if (!wasOffline && isNowOffline) {
        setIsOffline(true);
      }
      
      wasOffline = isNowOffline;
    };

    window.addEventListener('online', checkNetworkStatus);
    window.addEventListener('offline', checkNetworkStatus);

    // තත්පර 2න් 2කට බලෙන් චෙක් කිරීම (Refresh ප්‍රශ්නය විසඳීමට)
    const networkCheckInterval = setInterval(checkNetworkStatus, 2000);

    return () => {
      window.removeEventListener('online', checkNetworkStatus);
      window.removeEventListener('offline', checkNetworkStatus);
      clearInterval(networkCheckInterval);
    };
  }, [syncOfflineSales]);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === 'F1') {
        e.preventDefault();
        if (cart.length > 0) completeSale();
        else showAlert('Cart is empty', 'info');
      }
      if (e.key === 'F2') {
        e.preventDefault();
        barcodeRef.current?.focus();
      }
      if (e.key === 'F4') {
        e.preventDefault();
        if (cart.length > 0 && window.confirm("Are you sure you want to clear the cart?")) setCart([]);
      }
      if (e.key === 'Escape') {
        setShowCustomItemForm(false);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [cart, customerInfo, discount, discountType, billNotes]);

  // Direct Barcode Scanner Logic
  useEffect(() => {
    let barcode = '';
    let timeout;
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'Enter' && barcode) {
        handleBarcodeScanDirect(barcode);
        barcode = '';
      } else if (e.key.length === 1) {
        barcode += e.key;
        clearTimeout(timeout);
        timeout = setTimeout(() => { barcode = ''; }, 50);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [products]);

  const handleBarcodeScanDirect = async (code) => {
    try {
      const response = await api.getProductByBarcode(code);
      addToCart(response.data);
    } catch (error) {
      showAlert('Product not found!', 'error');
    }
  };

  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    if(!barcodeInput.trim()) return;
    handleBarcodeScanDirect(barcodeInput);
    setBarcodeInput('');
    barcodeRef.current?.focus(); 
  };

  const addCustomItemToCart = () => {
    if (!customItem.name || !customItem.price) return showAlert('Enter item name and price', 'error');
    const item = {
      id: `custom-${Date.now()}`, 
      name: customItem.name, 
      sellingPrice: parseFloat(customItem.price),
      receivedPrice: 0, 
      description: customItem.description || 'Custom item',
      quantity: parseInt(customItem.quantity) || 1, 
      category: 'custom', 
      barcode: 'CUSTOM',
      isCustom: true, 
      discount: 0, 
      discountType: 'percentage'
    };
    setCart(prev => [...prev, item]);
    setCustomItem({ name: '', price: '', quantity: 1, description: '' });
    setShowCustomItemForm(false);
    showAlert(`${item.name} added to cart`, 'success');
  };

  const addToCart = (product) => {
    if (product.stock <= 0) return showAlert(`Out of stock!`, 'error');
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) { showAlert('Stock limit reached', 'error'); return prev; }
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1, discount: 0, discountType: 'percentage' }];
    });
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.id !== productId));
    } else {
      const product = products.find(p => p.id === productId);
      if (product && !product.isCustom && quantity > product.stock) {
         return showAlert(`Only ${product.stock} units available!`, 'error');
      }
      setCart(prev => prev.map(item => item.id === productId ? { ...item, quantity } : item));
    }
  };

  const updateItemDiscount = (productId, discountVal, type) => {
    const validDiscount = isNaN(discountVal) ? 0 : discountVal;
    setCart(prev => prev.map(item => item.id === productId ? { ...item, discount: validDiscount, discountType: type } : item));
  };

  const calculateItemPrice = (item) => {
    if (item.discountType === 'percentage') return item.sellingPrice * (1 - (item.discount || 0) / 100);
    return Math.max(0, item.sellingPrice - (item.discount || 0));
  };

  const getCartTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
    const totalAfterItemDiscounts = cart.reduce((sum, item) => sum + (calculateItemPrice(item) * item.quantity), 0);
    
    const validDiscount = isNaN(discount) ? 0 : discount;
    const discountAmount = discountType === 'percentage' 
      ? (totalAfterItemDiscounts * validDiscount / 100) 
      : Math.min(validDiscount, totalAfterItemDiscounts);
      
    const total = totalAfterItemDiscounts - discountAmount;
    const totalCost = cart.reduce((sum, item) => sum + ((item.receivedPrice || 0) * item.quantity), 0);
    const profit = total - totalCost || 0;
    
    return { subtotal, discountAmount, total, profit, totalAfterItemDiscounts };
  };

  const completeSale = async () => {
    if (cart.length === 0) return showAlert('Cart is empty', 'error');
    
    const totals = getCartTotals();
    const saleData = {
      invoiceId: `INV-${Date.now()}`, 
      total: totals.total, 
      profit: totals.profit,
      discount: isNaN(discount) ? 0 : discount, 
      discountType: discountType.toUpperCase(),
      customerName: customerInfo.name, 
      customerPhone: customerInfo.phone,
      items: cart.map(item => ({
        productId: item.isCustom ? null : item.id, 
        productName: item.name,
        unitPrice: item.sellingPrice, 
        quantity: item.quantity,
        discount: isNaN(item.discount) ? 0 : item.discount, 
        discountType: (item.discountType || 'PERCENTAGE').toUpperCase(),
        isCustom: item.isCustom || false
      }))
    };

    setIsProcessing(true);
    try {
      await api.createSale(saleData);
      
      if (navigator.onLine) await fetchProducts(); 
      showAlert('Sale completed successfully!', 'success');

    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || !navigator.onLine) {
        console.warn("Network error detected, saving offline...", error);
        
        await saveSaleOffline(saleData);
        await updateOfflineStock(cart);
        checkUnsyncedSales(); 
        
        if (setProducts) {
          setProducts(prevProducts => prevProducts.map(p => {
            const cartItem = cart.find(c => c.id === p.id && !c.isCustom);
            if (cartItem) {
              return { ...p, stock: p.stock - cartItem.quantity };
            }
            return p;
          }));
        }

        showAlert('Network Offline. Sale saved locally!', 'warning');
      } else {
        console.error("Backend Error:", error);
        showAlert(error.response?.data?.message || 'Failed to complete sale.', 'error');
        setIsProcessing(false);
        return; 
      }
    }

    try {
      const htmlBill = generateBillHTML(saleData, storeInfo);
      downloadPDF(htmlBill, saleData.invoiceId);
      printIframe(htmlBill);
    } catch (printErr) {
      console.error("Printing error", printErr);
    }

    setCart([]); 
    setCustomerInfo({ name: '', phone: '', email: '', address: '' });
    setDiscount(0);
    setIsProcessing(false);
  };

  const printBillAction = () => {
    const saleData = {
       invoiceId: `PREVIEW-${Date.now()}`,
       date: Date.now(),
       total: getCartTotals().total,
       customerName: customerInfo.name,
       customerPhone: customerInfo.phone,
       items: cart
    };
    const htmlBill = generateBillHTML(saleData, storeInfo);
    printIframe(htmlBill);
  };

  const filteredProducts = products.filter(p => 
    (selectedCategory === 'all' || p.category === selectedCategory) &&
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.barcode.includes(searchTerm))
  );

  return (
    <div className="space-y-6">

      {isOffline && (
        <div className="bg-red-500 text-white p-3 rounded-lg shadow-lg flex items-center justify-center font-bold animate-pulse">
          <WifiOff className="w-5 h-5 mr-3" />
          INTERNET DISCONNECTED: Sales will be saved locally.
        </div>
      )}

      {unsyncedCount > 0 && !isOffline && (
        <div className="bg-yellow-500 text-white p-3 rounded-lg shadow-lg flex flex-col md:flex-row items-center justify-between font-bold">
          <div className="flex items-center mb-2 md:mb-0">
            <CloudOff className="w-5 h-5 mr-3" />
            You have {unsyncedCount} unsynced offline sale(s).
          </div>
          <button 
            onClick={syncOfflineSales} 
            disabled={isSyncing}
            className="bg-white text-yellow-600 px-4 py-2 rounded-lg shadow hover:bg-yellow-50 transition-colors flex items-center disabled:opacity-50"
          >
            {isSyncing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      )}

      <div className={`p-3 rounded-lg text-sm font-semibold flex flex-wrap justify-center gap-4 md:gap-6 ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-600 shadow'}`}>
         <span><kbd className="bg-gray-200 text-gray-800 px-2 py-1 rounded">F1</kbd> Pay & Print</span>
         <span><kbd className="bg-gray-200 text-gray-800 px-2 py-1 rounded">F2</kbd> Scanner</span>
         <span><kbd className="bg-gray-200 text-gray-800 px-2 py-1 rounded">F4</kbd> Clear Cart</span>
         <span><kbd className="bg-gray-200 text-gray-800 px-2 py-1 rounded">ESC</kbd> Close</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`rounded-xl shadow-lg p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-xl font-bold mb-4 flex items-center"><Barcode className="w-5 h-5 mr-2" /> Scanner (F2)</h2>
          <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
            <input 
              ref={barcodeRef}
              type="text" 
              placeholder="Scan barcode..." 
              value={barcodeInput} 
              onChange={(e) => setBarcodeInput(e.target.value)} 
              className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white'}`} 
              autoFocus
            />
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold">Add</button>
          </form>
        </div>
        
        <div className={`rounded-xl shadow-lg p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
           <h2 className="text-xl font-bold mb-4 flex items-center"><User className="w-5 h-5 mr-2" /> Customer Information</h2>
           <div className="flex gap-2">
              <input type="text" placeholder="Name" value={customerInfo.name} onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})} className={`w-1/2 px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`} />
              <input type="text" placeholder="Phone" value={customerInfo.phone} onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})} className={`w-1/2 px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`} />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className={`xl:col-span-2 rounded-xl shadow-lg p-6 flex flex-col ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold">Products</h2>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setShowCustomItemForm(true)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center font-semibold transition-colors"><PlusCircle className="w-4 h-4 mr-2"/> Custom Item</button>
              <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-48 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`} />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4 pb-2 overflow-x-auto">
             <button onClick={() => setSelectedCategory('all')} className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${selectedCategory === 'all' ? 'bg-indigo-600 text-white' : (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700')}`}>All</button>
             {categories.map(cat => (
               <button key={cat.id} onClick={() => setSelectedCategory(cat.name)} className={`px-3 py-1.5 rounded-lg text-sm capitalize whitespace-nowrap ${selectedCategory === cat.name ? 'bg-indigo-600 text-white' : (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700')}`}>{cat.name}</button>
             ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto pr-2">
            {filteredProducts.map(p => (
              <div key={p.id} onClick={() => addToCart(p)} className={`border rounded-xl p-3 cursor-pointer hover:shadow-md transition-all hover:border-indigo-400 flex flex-col ${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'hover:bg-indigo-50'}`}>
                <div className="h-24 bg-gray-100 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                   {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover" alt={p.name} /> : <Package className="w-8 h-8 text-gray-400" />}
                </div>
                <h3 className="font-semibold text-sm line-clamp-1" title={p.name}>{p.name}</h3>
                <span className="font-bold text-indigo-600 mt-1">Rs. {p.sellingPrice}</span>
                <div className="text-xs text-gray-500 mt-2 flex justify-between items-center">
                  <span>{p.barcode}</span>
                  <span className={`px-1.5 py-0.5 rounded font-medium ${p.stock > 5 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>Qty: {p.stock}</span>
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && <div className="col-span-full py-10 text-center text-gray-400">No products found</div>}
          </div>
        </div>

        <div className={`rounded-xl shadow-lg p-6 flex flex-col h-[700px] ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-3">
             <h2 className="text-2xl font-bold flex items-center">Cart <Receipt className="ml-2 text-indigo-600" /></h2>
             <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-1 rounded-full">{cart.length} Items</span>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
            {cart.map(item => {
              const discountedPrice = calculateItemPrice(item);
              return (
                <div key={item.id} className={`border p-3 rounded-xl ${isDarkMode ? 'border-gray-700 bg-gray-750' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-sm">{item.name}</h4>
                      <p className="text-xs text-gray-500">Rs. {item.sellingPrice} each</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-indigo-600">Rs. {(discountedPrice * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-600 p-0.5">
                      <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-gray-600 dark:text-gray-300"><Minus className="w-3.5 h-3.5"/></button>
                      <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                      <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded text-indigo-600 dark:text-indigo-400"><Plus className="w-3.5 h-3.5"/></button>
                    </div>
                    <div className="flex items-center gap-1">
                      <select value={item.discountType} onChange={e => updateItemDiscount(item.id, item.discount, e.target.value)} className={`text-xs border rounded p-1.5 outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}`}><option value="percentage">%</option><option value="fixed">Rs.</option></select>
                      <input type="number" value={isNaN(item.discount)?'':item.discount} onChange={e => updateItemDiscount(item.id, parseFloat(e.target.value), item.discountType)} className={`w-14 text-xs border rounded p-1.5 outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}`} placeholder="Dis."/>
                      <button onClick={() => updateCartQuantity(item.id, 0)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg ml-1"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  </div>
                </div>
              );
            })}
            {cart.length === 0 && <div className="text-center text-gray-400 py-10 flex flex-col items-center"><ShoppingCart className="w-12 h-12 mb-3 opacity-50"/>Cart is empty</div>}
          </div>

          <div className="mt-auto border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
             {cart.length > 0 && (
               <>
                 <div className="flex gap-2">
                   <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} className={`border rounded-lg p-2 text-sm outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}`}><option value="percentage">% Global Disc</option><option value="fixed">Rs. Global Disc</option></select>
                   <input type="number" value={isNaN(discount)?'':discount} onChange={(e) => setDiscount(parseFloat(e.target.value))} placeholder="Amount" className={`border rounded-lg p-2 text-sm flex-1 outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}`}/>
                 </div>
                 <textarea placeholder="Bill Notes..." value={billNotes} onChange={(e) => setBillNotes(e.target.value)} className={`w-full border rounded-lg p-2 text-sm outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}`} rows="1"/>
                 
                 <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-750 border border-gray-700' : 'bg-indigo-50 border border-indigo-100'}`}>
                   <div className="flex justify-between text-sm mb-1 text-gray-600 dark:text-gray-400"><span>Subtotal:</span><span className="font-semibold">Rs. {getCartTotals().subtotal.toFixed(2)}</span></div>
                   {getCartTotals().discountAmount > 0 && <div className="flex justify-between text-sm text-red-500 mb-1"><span>Discount:</span><span className="font-semibold">-Rs. {getCartTotals().discountAmount.toFixed(2)}</span></div>}
                   <div className="flex justify-between font-black text-2xl border-t border-indigo-200 dark:border-gray-600 mt-2 pt-2 text-indigo-700 dark:text-indigo-400"><span>Total:</span><span>Rs. {getCartTotals().total.toFixed(2)}</span></div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-3 mt-2">
                   <button onClick={printBillAction} className="bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 text-white p-3 rounded-xl font-bold flex justify-center items-center transition-colors shadow-md"><Printer className="w-5 h-5 mr-2"/> Print</button>
                   
                    <button 
                      onClick={completeSale} 
                      disabled={isProcessing || cart.length === 0} 
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white p-4 rounded-xl font-black text-xl flex justify-center items-center transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:grayscale"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                          SAVING...
                        </>
                      ) : (
                        <>
                          <Receipt className="w-6 h-6 mr-2"/> 
                          PAY (F1)
                        </>
                      )}
                    </button>
                 </div>
               </>
             )}
          </div>
        </div>
      </div>

      {showCustomItemForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl p-6 w-full max-w-sm shadow-2xl ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-6"><h3 className="font-bold text-xl">Custom Item</h3><button onClick={() => setShowCustomItemForm(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"><X className="w-5 h-5"/></button></div>
            <div className="space-y-4">
              <div>
                 <label className="text-xs font-bold text-gray-500 uppercase">Item Name</label>
                 <input type="text" value={customItem.name} onChange={(e) => setCustomItem({...customItem, name: e.target.value})} className={`w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 mt-1 ${isDarkMode ? 'bg-gray-700 border-gray-600' : ''}`} />
              </div>
              <div className="flex gap-4">
                 <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Price (Rs.)</label>
                    <input type="number" value={customItem.price} onChange={(e) => setCustomItem({...customItem, price: e.target.value})} className={`w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 mt-1 ${isDarkMode ? 'bg-gray-700 border-gray-600' : ''}`} />
                 </div>
                 <div className="w-1/3">
                    <label className="text-xs font-bold text-gray-500 uppercase">Qty</label>
                    <input type="number" value={customItem.quantity} onChange={(e) => setCustomItem({...customItem, quantity: e.target.value})} className={`w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 mt-1 ${isDarkMode ? 'bg-gray-700 border-gray-600' : ''}`} />
                 </div>
              </div>
              <button onClick={addCustomItemToCart} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-lg mt-4 transition-colors">Add to Cart</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;