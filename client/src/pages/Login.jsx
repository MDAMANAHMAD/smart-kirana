import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, forgotPassword } from '../api';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, HelpCircle } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const email = formData.email.trim();
      const password = formData.password.trim();
      const { data } = await login({ email, password });
      loginUser(data.user, data.token);
      navigate(data.user.role === 'retailer' ? '/dashboard' : '/');
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  const handleForgotPassword = async () => {
    const email = prompt("Please enter your registered email address:");
    if (!email) return;

    try {
      const { data } = await forgotPassword({ email });
      alert(data.message);
    } catch (err) {
      alert(err.response?.data?.message || 'Error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full p-10 rounded-[2.5rem] shadow-premium relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16" />
        
        <div className="relative">
          <h2 className="text-4xl font-black text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-500 mb-10 font-medium">Log in to manage your store or start shopping.</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-bold text-gray-700">Password</label>
                <button 
                  type="button" 
                  onClick={handleForgotPassword}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <HelpCircle size={12} /> Forgot?
                </button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              <LogIn size={20} />
              Sign In
            </button>
          </form>

          <p className="text-center mt-8 text-gray-500 font-medium">
            Don't have an account? <Link to="/register" className="text-blue-600 font-bold hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
