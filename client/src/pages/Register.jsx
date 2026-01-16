import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api';
import { UserPlus, Mail, Lock, User, Phone, MapPin, ArrowRight } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer',
    phoneNumber: '',
    address: ''
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 py-20">
      <div className="bg-white max-w-lg w-full rounded-[3rem] shadow-premium overflow-hidden border border-slate-100 animate-in fade-in slide-in-from-bottom-10 duration-700">
        <div className="p-12">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-blue-200 mb-6 group hover:rotate-12 transition-transform">
              <UserPlus size={40} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Create Account</h1>
            <p className="text-slate-400 font-medium mt-2 leading-relaxed">Join Smart-Kirana today and experience <br /> AI-powered hyperlocal shopping.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text"
                placeholder="Full Name"
                className="w-full pl-16 pr-6 py-5 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-900"
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="relative group">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full pl-16 pr-6 py-5 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-900"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative group">
                <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="Phone No"
                  className="w-full pl-14 pr-4 py-5 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-900"
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  required
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full pl-14 pr-4 py-5 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-900"
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="relative group">
              <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text"
                placeholder="Delivery Address"
                className="w-full pl-16 pr-6 py-5 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-900"
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>

            <div className="flex gap-4 p-2 bg-slate-50 rounded-2xl">
              {['customer', 'retailer', 'wholesaler'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setFormData({ ...formData, role })}
                  className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${formData.role === role ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-100'
                    }`}
                >
                  {role}
                </button>
              ))}
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black text-xl shadow-2xl shadow-blue-100 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
              Sign Up <ArrowRight size={24} />
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-400 font-bold">Already have an account? <Link to="/login" className="text-blue-600 hover:underline inline-flex items-center gap-1">Log In <ArrowRight size={14} /></Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
