import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, User, Moon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('admin_token', data.token);
        toast.success('Welcome back, Siam!');
        navigate('/admin/dashboard');
      } else {
        toast.error(data.error || 'Login failed');
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-primary flex items-center justify-center p-6 islamic-pattern">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass p-8 rounded-3xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gold-primary p-4 rounded-full mb-4 shadow-lg">
            <Moon className="text-emerald-primary fill-emerald-primary" size={32} />
          </div>
          <h1 className="text-2xl font-islamic font-bold text-emerald-primary">Admin Portal</h1>
          <p className="text-emerald-secondary/60">Secure access for Siam Mahmud Mukti</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-primary/40" size={20} />
            <input
              required
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-emerald-primary/10 focus:ring-2 focus:ring-emerald-primary/50 outline-none bg-white/50"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-primary/40" size={20} />
            <input
              required
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-emerald-primary/10 focus:ring-2 focus:ring-emerald-primary/50 outline-none bg-white/50"
            />
          </div>
          <button
            disabled={loading}
            type="submit"
            className="w-full btn-gold py-4 text-lg disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Login to Dashboard'}
          </button>
        </form>
        
        <div className="mt-8 text-center">
          <button 
            onClick={() => navigate('/')}
            className="text-emerald-primary/60 hover:text-emerald-primary text-sm transition-colors"
          >
            &larr; Back to Public Site
          </button>
        </div>
      </motion.div>
    </div>
  );
}
