import React, { useState, useContext, useEffect, useMemo } from 'react';
import { POSContext } from '../context/POSContext';
import { Eye, Download, Printer, RefreshCw, X, Search, Minus, Plus } from 'lucide-react';
import { generateBillHTML, printIframe, downloadPDF } from '../utils/receiptUtils';
import api from '../api';

const safelyGetDateString = (dateValue) => {
  if (!dateValue) return null;
  if (Array.isArray(dateValue)) {
    const [year, month, day] = dateValue;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  if (typeof dateValue === 'string') return dateValue.split('T')[0].substring(0, 10);
  return null;
};

const SalesHistory = ({ isDarkMode }) => {
  const { sales, storeInfo, fetchSales, showAlert, setIsProcessing, fetchProducts } = useContext(POSContext);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [salesSearchTerm, setSalesSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({ startDate: '', endDate: '', selectedDate: '' });

  const [selectedSale, setSelectedSale] = useState(null);
  const [showSaleDetails, setShowSaleDetails] = useState(false);
  
  const [saleToReturn, setSaleToReturn] = useState(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnItems, setReturnItems] = useState([]);
  const [returnReason, setReturnReason] = useState('');

  useEffect(() => { fetchSales(); }, []);

  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const searchStr = salesSearchTerm.toLowerCase();
      const matchesSearch = String(sale.invoiceId || '').toLowerCase().includes(searchStr) ||
                            (sale.customerName || sale.customerInfo?.name || '').toLowerCase().includes(searchStr);
      let matchesDate = true;
      if (dateFilter.selectedDate || (dateFilter.startDate && dateFilter.endDate)) {
        const saleDateStr = safelyGetDateString(sale.saleDate || sale.date);
        if (!saleDateStr) matchesDate = false; 
        else {
          if (dateFilter.selectedDate) matchesDate = saleDateStr === dateFilter.selectedDate;
          else matchesDate = saleDateStr >= dateFilter.startDate && saleDateStr <= dateFilter.endDate;
        }
      }
      return matchesSearch && matchesDate;
    });
  }, [sales, salesSearchTerm, dateFilter]);

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const currentSales = filteredSales.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePrint = (sale) => printIframe(generateBillHTML(sale, storeInfo));
  const handleDownload = (sale) => downloadPDF(generateBillHTML(sale, storeInfo), sale.invoiceId);
  const clearFilters = () => { setDateFilter({ selectedDate: '', startDate: '', endDate: '' }); setSalesSearchTerm(''); setCurrentPage(1); };

  const initReturn = (sale) => { setSaleToReturn(sale); setReturnItems(sale.items.map(item => ({ ...item, returnQty: 0 }))); setShowReturnModal(true); };
  const updateReturnQty = (index, quantity) => { setReturnItems(prev => prev.map((item, i) => i === index ? { ...item, returnQty: Math.min(quantity, item.quantity) } : item)); };

  const processReturn = async () => {
    setIsProcessing(true);
    try {
      const payload = { 
        originalInvoiceId: saleToReturn.invoiceId, 
        returnItems: returnItems.filter(item => item.returnQty > 0).map(item => ({
          productId: item.productId || null, productName: item.productName || 'Unknown Item',
          quantity: item.returnQty, unitPrice: item.unitPrice || 0, isCustom: item.isCustom || false
        })), 
        returnReason: returnReason 
      };
      await api.processReturn(payload);
      await fetchSales(); await fetchProducts();
      setShowReturnModal(false); setReturnReason(''); setSaleToReturn(null);
      showAlert('Return processed successfully!', 'success');
    } catch (error) { showAlert('Failed to process return', 'error'); } 
    finally { setIsProcessing(false); }
  };

  const bgClass = isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white text-gray-800';
  const subBgClass = isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200';
  const inputBgClass = isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300';
  const tableHeaderClass = isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-600';
  const rowClass = isDarkMode ? 'border-gray-700 hover:bg-gray-750 text-gray-300' : 'border-gray-100 hover:bg-gray-50 text-gray-800';

  return (
    <div className="space-y-6">
      <div className={`${bgClass} rounded-xl shadow-lg p-6`}>
        <h2 className="text-2xl font-bold mb-4 flex justify-between items-center">
          Sales History 
          <div className="flex gap-2">
             <button onClick={clearFilters} className={`text-sm px-3 py-1 rounded-lg font-semibold ${isDarkMode ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Clear Filters</button>
             <button onClick={fetchSales} className="text-sm bg-indigo-600 text-white px-3 py-1 flex items-center rounded-lg hover:bg-indigo-700"><RefreshCw className="w-4 h-4 mr-1"/> Sync Database</button>
          </div>
        </h2>
        
        <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl border ${subBgClass}`}>
          <div className="relative">
            <label className={`text-xs font-bold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Search Invoice/Name</label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
              <input type="text" placeholder="Search..." value={salesSearchTerm} onChange={(e) => {setSalesSearchTerm(e.target.value); setCurrentPage(1);}} className={`pl-10 w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 ${inputBgClass}`}/>
            </div>
          </div>
          <div>
            <label className={`text-xs font-bold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Specific Date</label>
            <input type="date" value={dateFilter.selectedDate} onChange={e=>{setDateFilter({...dateFilter, selectedDate: e.target.value, startDate:'', endDate:''}); setCurrentPage(1);}} className={`mt-1 w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 ${inputBgClass}`} />
          </div>
          <div>
            <label className={`text-xs font-bold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Start Date</label>
            <input type="date" value={dateFilter.startDate} onChange={e=>{setDateFilter({...dateFilter, startDate: e.target.value, selectedDate:''}); setCurrentPage(1);}} className={`mt-1 w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 ${inputBgClass}`} />
          </div>
          <div>
            <label className={`text-xs font-bold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>End Date</label>
            <input type="date" value={dateFilter.endDate} onChange={e=>{setDateFilter({...dateFilter, endDate: e.target.value, selectedDate:''}); setCurrentPage(1);}} className={`mt-1 w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 ${inputBgClass}`} />
          </div>
        </div>
      </div>

      <div className={`${bgClass} p-6 rounded-xl shadow-lg border`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`${tableHeaderClass} border-b`}>
              <th className="p-3 rounded-tl-lg">Invoice</th><th className="p-3">Date</th><th className="p-3">Customer</th>
              <th className="p-3">Items</th><th className="p-3">Total</th><th className="p-3 text-center rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentSales.map(sale => (
              <tr key={sale.id} className={`border-b transition-colors ${rowClass}`}>
                <td className="p-3 font-mono text-sm">{sale.isReturn && <span className="text-red-500 text-xs font-bold mr-1">RETURN</span>}{sale.invoiceId}</td>
                <td className="p-3">{safelyGetDateString(sale.saleDate || sale.date)}</td>
                <td className="p-3">{sale.customerName || sale.customerInfo?.name || 'Walk-in'}</td>
                <td className="p-3">{sale.items?.length || 0}</td>
                <td className={`p-3 font-bold ${sale.total < 0 ? 'text-red-500':'text-green-500'}`}>${Math.abs(sale.total).toFixed(2)}</td>
                <td className="p-3 flex space-x-2 justify-center">
                  <button onClick={() => { setSelectedSale(sale); setShowSaleDetails(true); }} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-500 hover:bg-gray-200'}`} title="Details"><Eye className="w-5 h-5"/></button>
                  <button onClick={() => handlePrint(sale)} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-blue-400 hover:bg-blue-900/30' : 'text-blue-500 hover:bg-blue-100'}`} title="Print"><Printer className="w-5 h-5"/></button>
                  <button onClick={() => handleDownload(sale)} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-indigo-400 hover:bg-indigo-900/30' : 'text-indigo-500 hover:bg-indigo-100'}`} title="Download PDF"><Download className="w-5 h-5"/></button>
                  {!sale.isReturn && <button onClick={() => initReturn(sale)} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-red-400 hover:bg-red-900/30' : 'text-red-500 hover:bg-red-100'}`} title="Return"><RefreshCw className="w-5 h-5"/></button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredSales.length === 0 && (
           <div className={`text-center py-12 flex flex-col items-center justify-center mt-4 rounded-xl border border-dashed ${subBgClass}`}>
              <Search className={`w-12 h-12 mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
              <p className={`font-medium text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No records found!</p>
           </div>
        )}

        <div className={`flex justify-between items-center mt-6 border-t pt-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className={`px-4 py-2 border rounded-lg disabled:opacity-50 font-medium ${isDarkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100 text-gray-600'}`}>Previous</button>
          <span className={`font-medium px-4 py-1 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>Page {currentPage} of {totalPages || 1}</span>
          <button disabled={currentPage >= totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className={`px-4 py-2 border rounded-lg disabled:opacity-50 font-medium ${isDarkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100 text-gray-600'}`}>Next</button>
        </div>
      </div>

      {/* Modals remain mostly the same, just conditionally applying bgClass */}
      {showSaleDetails && selectedSale && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${bgClass} rounded-2xl p-6 w-[600px] max-h-[85vh] overflow-y-auto shadow-2xl`}>
             <div className="flex justify-between items-center mb-6 border-b pb-4"><h3 className="font-bold text-2xl">Sale Details <span className="text-sm font-mono opacity-50 ml-2">{selectedSale.invoiceId}</span></h3><button onClick={() => setShowSaleDetails(false)} className="p-2 hover:bg-gray-500/20 rounded-full"><X/></button></div>
             <div className={`grid grid-cols-2 gap-4 p-4 rounded-xl mb-6 border ${isDarkMode ? 'bg-indigo-900/20 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'}`}>
                <div><p className="text-indigo-400 text-xs font-bold uppercase mb-1">Customer</p><p className="font-bold text-lg">{selectedSale.customerName || 'Walk-in'}</p></div>
                <div><p className="text-indigo-400 text-xs font-bold uppercase mb-1">Total</p><p className="font-bold text-xl text-green-500">${Math.abs(selectedSale.total).toFixed(2)}</p></div>
             </div>
             {/* Simple items table */}
             <table className="w-full text-left">
                <thead className={tableHeaderClass}><tr><th className="p-2">Item</th><th className="p-2">Qty</th><th className="p-2 text-right">Price</th></tr></thead>
                <tbody>{selectedSale.items.map((it, idx) => <tr key={idx} className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}><td className="p-2">{it.productName}</td><td className="p-2">{it.quantity}</td><td className="p-2 text-right">${it.unitPrice}</td></tr>)}</tbody>
             </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesHistory;