import React, { useState, useContext, useRef } from 'react';
import { POSContext } from '../context/POSContext';
import { Plus, X, Edit, Trash2, Image as ImageIcon, Upload, Package, Save, Loader2 } from 'lucide-react';
import axios from 'axios';
import api from '../api';

const CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/dkks7qctm/image/upload';
const UPLOAD_PRESET = 'pos-img';

const Inventory = ({ isDarkMode }) => {
  
  const { products, fetchProducts, categories, fetchCategories, showAlert, isProcessing, setIsProcessing } = useContext(POSContext); 
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newCategory, setNewCategory] = useState('');
  
  const [editingProductId, setEditingProductId] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);
  
  const [newProduct, setNewProduct] = useState({
    name: '', receivedPrice: '', sellingPrice: '', description: '', stock: '', category: '', barcode: '', imageUrl: ''
  });

  const filteredProducts = products.filter(p => 
    (selectedCategory === 'all' || p.category === selectedCategory) &&
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.barcode.includes(searchTerm))
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleImageUpload = async (event, isEditing = false) => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return showAlert('File size too large (Max 2MB).', 'error');

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
      const response = await axios.post(CLOUDINARY_UPLOAD_URL, formData);
      const imageUrl = response.data.secure_url;
      if (isEditing) setEditingProduct(prev => ({ ...prev, imageUrl }));
      else setNewProduct(prev => ({ ...prev, imageUrl }));
      showAlert('Image uploaded successfully', 'success');
    } catch (error) {
      showAlert('Image upload failed', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    setIsProcessing(true);
    try {
      await api.createCategory({ name: newCategory });
      await fetchCategories();
      setNewCategory('');
      showAlert('Category added', 'success');
    } catch (error) { showAlert('Error adding category', 'error'); } 
    finally { setIsProcessing(false); }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.sellingPrice || !newProduct.category) {
      return showAlert('Name, Category, and Selling Price are required!', 'error');
    }
    const categoryObj = categories.find(cat => cat.name === newProduct.category);
    setIsProcessing(true);
    try {
      await api.createProduct({
        ...newProduct, receivedPrice: parseFloat(newProduct.receivedPrice) || 0,
        sellingPrice: parseFloat(newProduct.sellingPrice) || 0, stock: parseInt(newProduct.stock) || 0, categoryId: categoryObj?.id
      });
      await fetchProducts();
      setNewProduct({ name: '', receivedPrice: '', sellingPrice: '', description: '', stock: '', category: '', barcode: '', imageUrl: '' });
      showAlert('Product added successfully', 'success');
    } catch (error) { showAlert('Failed to add product.', 'error'); } 
    finally { setIsProcessing(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    setIsProcessing(true);
    try { await api.deleteProduct(id); await fetchProducts(); showAlert('Product deleted', 'info'); } 
    catch (error) { showAlert('Failed to delete', 'error'); } 
    finally { setIsProcessing(false); }
  };

  const handleUpdate = async () => {
    setIsProcessing(true);
    try { await api.updateProduct(editingProductId, editingProduct); await fetchProducts(); setEditingProductId(null); setEditingProduct(null); showAlert('Product updated', 'success'); } 
    catch (error) { showAlert('Update failed', 'error'); } 
    finally { setIsProcessing(false); }
  };

  const bgClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white';
  const textClass = isDarkMode ? 'text-white' : 'text-gray-800';
  const inputBgClass = isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300';
  const tableHeaderClass = isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-600';
  const rowClass = isDarkMode ? 'border-gray-700 hover:bg-gray-750 text-gray-300' : 'border-gray-200 hover:bg-gray-50';

  return (
    <div className="space-y-6">
      <input type="file" ref={fileInputRef} onChange={(e) => handleImageUpload(e, false)} accept="image/*" className="hidden" />
      <input type="file" ref={editFileInputRef} onChange={(e) => handleImageUpload(e, true)} accept="image/*" className="hidden" />

      {/* Add New Product Section */}
      <div className={`${bgClass} rounded-xl shadow-lg p-6`}>
        <h2 className={`text-2xl font-bold mb-6 ${textClass}`}>Add New Product</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="text" placeholder="Product Name *" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className={`p-2 border rounded outline-none focus:ring-2 focus:ring-indigo-500 ${inputBgClass}`} />
          <input type="number" placeholder="Selling Price *" value={newProduct.sellingPrice} onChange={e => setNewProduct({...newProduct, sellingPrice: e.target.value})} className={`p-2 border rounded outline-none focus:ring-2 focus:ring-indigo-500 ${inputBgClass}`} />
          <input type="number" placeholder="Received Price" value={newProduct.receivedPrice} onChange={e => setNewProduct({...newProduct, receivedPrice: e.target.value})} className={`p-2 border rounded outline-none focus:ring-2 focus:ring-indigo-500 ${inputBgClass}`} />
          <input type="number" placeholder="Stock Quantity" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} className={`p-2 border rounded outline-none focus:ring-2 focus:ring-indigo-500 ${inputBgClass}`} />
          <input type="text" placeholder="Barcode/SKU" value={newProduct.barcode} onChange={e => setNewProduct({...newProduct, barcode: e.target.value})} className={`p-2 border rounded outline-none focus:ring-2 focus:ring-indigo-500 ${inputBgClass}`} />
          <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className={`p-2 border rounded outline-none focus:ring-2 focus:ring-indigo-500 ${inputBgClass}`}>
            <option value="">Select Category *</option>
            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-4">
           <textarea placeholder="Product Description" value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} className={`lg:col-span-2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none ${inputBgClass}`} rows="2" />
           <div className="flex gap-2">
             <input type="text" placeholder="New category" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className={`flex-1 px-3 py-2 border rounded-lg outline-none ${inputBgClass}`} />
             <button onClick={handleAddCategory} className="bg-gray-600 hover:bg-gray-700 text-white px-3 rounded-lg"><Plus className="w-5 h-5" /></button>
           </div>
          
              <button 
                onClick={handleAddProduct} 
                disabled={isProcessing}
                className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 flex items-center justify-center transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2"/> 
                    ADD PRODUCT
                  </>
                )}
              </button>
        </div>

        <div className="mt-4 flex items-center gap-4">
           {newProduct.imageUrl ? (
              <img src={newProduct.imageUrl} alt="preview" className="w-16 h-16 object-cover rounded border"/>
           ) : (
              <button onClick={() => fileInputRef.current?.click()} className={`flex items-center px-4 py-2 rounded ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}>
                <Upload className="w-4 h-4 mr-2"/> Upload Image
              </button>
           )}
        </div>
      </div>

      {/* Inventory List Section */}
      <div className={`${bgClass} rounded-xl shadow-lg p-6`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className={`text-2xl font-bold ${textClass}`}>Current Inventory</h2>
          <div className="flex gap-2">
             <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className={`p-2 border rounded outline-none ${inputBgClass}`}>
                <option value="all">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
             </select>
             <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={`p-2 border rounded w-full md:w-64 outline-none ${inputBgClass}`} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`${tableHeaderClass}`}>
                <th className="p-3 rounded-tl-lg">Product</th>
                <th className="p-3">SKU</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3 rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.map(p => (
                <tr key={p.id} className={`border-b ${rowClass}`}>
                  <td className="p-3 flex items-center">
                    {p.imageUrl ? <img src={p.imageUrl} alt="img" className="w-10 h-10 object-cover rounded mr-3"/> : <Package className="w-10 h-10 text-gray-400 mr-3"/>}
                    {editingProductId === p.id ? 
                      <input type="text" value={editingProduct.name} onChange={e=>setEditingProduct({...editingProduct, name: e.target.value})} className={`border p-1 w-full rounded ${inputBgClass}`}/> 
                      : <div className="flex flex-col"><span className="font-semibold">{p.name}</span><span className="text-xs opacity-70">{p.category}</span></div>
                    }
                  </td>
                  <td className="p-3 font-mono text-sm">{p.barcode}</td>
                  <td className="p-3">
                    {editingProductId === p.id ? 
                      <input type="number" value={editingProduct.sellingPrice} onChange={e=>setEditingProduct({...editingProduct, sellingPrice: e.target.value})} className={`border p-1 w-20 rounded ${inputBgClass}`}/> 
                      /* 💡 මෙතන $ සලකුණ වෙනුවට Rs. යෙදුවා */
                      : <span className="font-bold text-indigo-500">Rs. {p.sellingPrice}</span>
                    }
                  </td>
                  <td className="p-3">
                    {editingProductId === p.id ? 
                      <input type="number" value={editingProduct.stock} onChange={e=>setEditingProduct({...editingProduct, stock: e.target.value})} className={`border p-1 w-20 rounded ${inputBgClass}`}/> 
                      : <span className={`px-2 py-1 rounded-md text-xs font-bold ${p.stock > 5 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>{p.stock}</span>
                    }
                  </td>
                  <td className="p-3">
                    <div className="flex gap-3">
                      {editingProductId === p.id ? (
                        <>
                          <button onClick={handleUpdate} className="text-green-500 hover:text-green-400"><Save className="w-5 h-5"/></button>
                          <button onClick={() => setEditingProductId(null)} className="text-gray-500 hover:text-gray-400"><X className="w-5 h-5"/></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditingProductId(p.id); setEditingProduct(p); }} className="text-indigo-500 hover:text-indigo-400"><Edit className="w-5 h-5"/></button>
                          <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-400"><Trash2 className="w-5 h-5"/></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className={`px-4 py-2 border rounded-lg disabled:opacity-50 ${isDarkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'}`}>Previous</button>
          <span className={`font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Page {currentPage} of {totalPages || 1}</span>
          <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} className={`px-4 py-2 border rounded-lg disabled:opacity-50 ${isDarkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'}`}>Next</button>
        </div>
      </div>
    </div>
  );
};

export default Inventory;