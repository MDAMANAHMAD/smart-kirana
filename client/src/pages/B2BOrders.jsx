import React, { useEffect, useState } from 'react';
import { fetchB2BOrders, fulfillB2BOrder, updateB2BOrderStatus } from '../api';
import { Package, Truck, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';

const B2BOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      const { data } = await fetchB2BOrders();
      setOrders(data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateB2BOrderStatus(id, status);
      loadOrders();
    } catch (err) {
      console.error("Status Update Error:", err);
      alert(`Status update failed: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleFulfill = async (id) => {
    if (window.confirm("Fulfill this order? This will sync the items to the retailer's active inventory.")) {
      try {
        await fulfillB2BOrder(id);
        alert("Order Fulfilled Successfully!");
        loadOrders();
      } catch (err) {
        console.error("Fulfillment Error:", err);
        alert(`Fulfillment failed: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'fulfilled': return 'bg-emerald-100 text-emerald-600';
      case 'accepted': return 'bg-blue-100 text-blue-600';
      case 'rejected': return 'bg-red-100 text-red-600';
      default: return 'bg-amber-100 text-amber-600';
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen p-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-black text-slate-900 mb-12 tracking-tighter">सक्रिय व्यापार <span className="text-blue-600">(Trade Pipeline)</span></h1>

        {loading ? (
             <div className="text-center py-20 font-bold text-slate-400">Loading B2B Pipeline...</div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order._id} className="bg-white p-10 rounded-[3rem] shadow-premium border border-slate-50 flex flex-col md:flex-row gap-10">
                 <div className="flex-1">
                    <div className="flex items-center gap-4 mb-6">
                       <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                          {order.status}
                       </span>
                       <span className="text-slate-400 font-bold text-sm">ID: {order._id.slice(-8)}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
                             <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-blue-600 text-xs">{item.quantity}</div>
                             <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                          </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-6">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Retailer</p>
                            <p className="font-bold text-slate-900 uppercase tracking-tighter">Retailer-{order.retailerId.slice(-6)}</p>
                        </div>
                        <div className="w-px h-8 bg-slate-100" />
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Created</p>
                            <p className="font-bold text-slate-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                 </div>

                 <div className="md:w-64 flex flex-col justify-between items-end">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Order Value</p>
                        <p className="text-4xl font-black text-blue-600 tracking-tighter">₹{order.totalAmount.toLocaleString()}</p>
                    </div>
                    
                    <div className="w-full space-y-3">
                         {order.status === 'pending' && (
                             <div className="flex gap-2">
                                <button onClick={() => handleStatusUpdate(order._id, 'accepted')} className="flex-1 bg-blue-600 text-white py-4 rounded-3xl font-black text-xs hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                                    <CheckCircle size={16} /> Accept
                                </button>
                                <button onClick={() => handleStatusUpdate(order._id, 'rejected')} className="flex-1 bg-slate-100 text-slate-400 py-4 rounded-3xl font-black text-xs hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center gap-2 border border-slate-50">
                                    <XCircle size={16} /> Reject
                                </button>
                             </div>
                         )}
                         {order.status === 'accepted' && (
                            <button 
                             onClick={() => handleFulfill(order._id)}
                             className="w-full bg-emerald-600 text-white py-5 rounded-3xl font-black shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 mt-8"
                            >
                                <Truck size={20} /> Fulfill & Sync
                            </button>
                         )}
                    </div>
                 </div>
              </div>
            ))}

            {orders.length === 0 && (
                <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-slate-100">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Package className="text-slate-200" size={40} />
                    </div>
                    <p className="text-slate-400 font-bold">No active B2B orders in the pipeline.</p>
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default B2BOrders;
