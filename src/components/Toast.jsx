import React, { useContext } from 'react';
import { POSContext } from '../context/POSContext';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

const Toast = () => {
  const { toast } = useContext(POSContext);

  if (!toast.show) return null;

  return (
    <div className={`fixed top-4 right-4 flex items-center p-4 rounded-lg shadow-lg text-white transition-all duration-300 z-[10000] ${
      toast.type === 'error' ? 'bg-red-500' : toast.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
    }`}>
      {toast.type === 'error' && <AlertCircle className="w-5 h-5 mr-2" />}
      {toast.type === 'success' && <CheckCircle className="w-5 h-5 mr-2" />}
      {toast.type === 'info' && <Info className="w-5 h-5 mr-2" />}
      <span>{toast.message}</span>
    </div>
  );
};

export default Toast;