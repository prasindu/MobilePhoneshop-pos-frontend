import React, { createContext, useState, useEffect } from 'react';
import api from '../api';
import { saveProductsOffline, getProductsOffline } from '../utils/db'

export const POSContext = createContext();

export const POSProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sales, setSales] = useState([]);
  
  // Global States
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [storeInfo] = useState({ 
    name: 'MobileHub Store', tagline: 'Your One Stop Mobile Shop', 
    address: '123 Tech Street, Tech City', phone: '+1 (555) 123-4567', 
    email: 'info@mobilehub.com', website: 'www.mobilehub.com', taxId: 'TAX-123456' 
  });

  // Billing States
  const [cart, setCart] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', email: '', address: '' });
  const [billNotes, setBillNotes] = useState('');
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('percentage');

  const showAlert = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 8000);
  };


const fetchProducts = async () => {
  setIsProcessing(true);
  try { 
    const res = await api.getProducts(); 
    setProducts(res.data); 
    
    await saveProductsOffline(res.data); 
  } catch (err) { 
    console.warn("Offline Mode: Loading products from Local DB..."); 
    
    const offlineProducts = await getProductsOffline();
    if (offlineProducts.length > 0) {
      setProducts(offlineProducts);
      showAlert("You are offline. Loading saved inventory.", "warning");
    } else {
      showAlert("You are offline and no inventory is saved locally.", "error");
    }
  } finally {
    setIsProcessing(false);
  }
};

const fetchCategories = async () => {
  setIsProcessing(true);
  try { 
    const res = await api.getCategories(); 
    setCategories(res.data); 
  } catch (err) { 
    console.error("Categories Load Error", err); 
  } finally {
    setIsProcessing(false);
  }
};

const fetchSales = async () => {
  setIsProcessing(true);
  try { 
    const res = await api.getSales(); 
    setSales(res.data); 
  } catch (err) { 
    console.error("Sales Load Error", err); 
  } finally {
    setIsProcessing(false);
  }
};
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchProducts();
      fetchCategories();
      fetchSales();
    }
  }, []);

  return (
    <POSContext.Provider value={{
      products, setProducts, categories, setCategories, sales, setSales,
      toast, showAlert, isProcessing, setIsProcessing, storeInfo,
      cart, setCart, customerInfo, setCustomerInfo, billNotes, setBillNotes, 
      discount, setDiscount, discountType, setDiscountType,
      fetchProducts, fetchCategories, fetchSales
    }}>
      {children}
    </POSContext.Provider>
  );
};