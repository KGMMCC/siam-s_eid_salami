import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Settings as SettingsIcon, 
  LogOut, 
  Check, 
  X, 
  Trash2, 
  Download,
  TrendingUp,
  Users,
  Clock,
  Home,
  Moon,
  Star,
  Wallet
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Submission, Settings as SettingsType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import socket from '../lib/socket';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('admin_token');

  useEffect(() => {
    if (!token) navigate('/admin/login');
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  const fetchWithAuth = async (url: string, options: any = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      }
    });
    if (res.status === 401 || res.status === 403) {
      handleLogout();
      throw new Error('Unauthorized');
    }
    return res;
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-emerald-primary text-white p-8 flex flex-col relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-5 -mr-10 -mt-10">
          <Moon size={200} />
        </div>
        
        <div className="flex items-center gap-3 mb-16 relative z-10">
          <div className="bg-gold-primary p-2.5 rounded-2xl shadow-lg shadow-gold-primary/20">
            <LayoutDashboard className="text-emerald-primary" size={24} />
          </div>
          <span className="font-islamic font-bold text-2xl tracking-tighter">Admin Hub</span>
        </div>

        <nav className="flex-1 space-y-3 relative z-10">
          <SidebarLink to="/admin/dashboard" icon={<TrendingUp size={20} />} label="Overview" active={location.pathname === '/admin/dashboard'} />
          <SidebarLink to="/admin/dashboard/submissions" icon={<MessageSquare size={20} />} label="Submissions" active={location.pathname === '/admin/dashboard/submissions'} />
          <SidebarLink to="/admin/dashboard/settings" icon={<SettingsIcon size={20} />} label="Settings" active={location.pathname === '/admin/dashboard/settings'} />
          <div className="pt-6 mt-6 border-t border-white/10">
            <SidebarLink to="/" icon={<Home size={20} />} label="Public Site" active={false} />
          </div>
        </nav>

        <button 
          onClick={handleLogout}
          className="mt-auto flex items-center gap-3 p-4 text-white/50 hover:text-white hover:bg-white/5 rounded-2xl transition-all group"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Sign Out</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Routes>
              <Route path="/" element={<Overview fetchWithAuth={fetchWithAuth} />} />
              <Route path="/submissions" element={<Submissions fetchWithAuth={fetchWithAuth} />} />
              <Route path="/settings" element={<Settings fetchWithAuth={fetchWithAuth} />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function SidebarLink({ to, icon, label, active }: { to: string, icon: any, label: string, active: boolean }) {
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${active ? 'bg-gold-primary text-emerald-primary font-bold shadow-xl shadow-gold-primary/10' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
    >
      <span className={active ? 'scale-110' : ''}>{icon}</span>
      <span className="tracking-wide">{label}</span>
      {active && <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-primary" />}
    </Link>
  );
}

function Overview({ fetchWithAuth }: { fetchWithAuth: any }) {
  const [stats, setStats] = useState<any>(null);

  const loadStats = () => {
    fetchWithAuth('/api/admin/stats').then((res: any) => res.json()).then(setStats);
  };

  useEffect(() => {
    loadStats();

    socket.on('new_submission', () => {
      loadStats();
      toast('New submission received!', { icon: '🔔' });
    });

    socket.on('submissions_updated', loadStats);

    return () => {
      socket.off('new_submission');
      socket.off('submissions_updated');
    };
  }, []);

  if (!stats) return <div className="animate-pulse space-y-8">
    <div className="h-10 w-64 bg-neutral-200 rounded-xl" />
    <div className="grid grid-cols-3 gap-6">
      {[1,2,3].map(i => <div key={i} className="h-32 bg-neutral-200 rounded-3xl" />)}
    </div>
  </div>;

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-islamic font-bold text-emerald-primary">Dashboard Overview</h1>
        <div className="text-sm text-neutral-400 font-medium">Welcome back, Siam Mahmud Mukti</div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <StatCard title="Total Salami" value={`৳${stats.totalSalami}`} icon={<TrendingUp size={24} />} color="bg-emerald-primary" />
        <StatCard title="Total Submissions" value={stats.totalSubmissions} icon={<Users size={24} />} color="bg-blue-600" />
        <StatCard title="Pending Review" value={stats.pendingSubmissions} icon={<Clock size={24} />} color="bg-orange-500" />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="glass p-10 rounded-[2.5rem] relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
            <Star size={200} />
          </div>
          <h2 className="text-2xl font-islamic font-bold mb-6 text-emerald-primary">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link to="/admin/dashboard/submissions" className="btn-primary px-8">Review Submissions</Link>
            <Link to="/admin/dashboard/settings" className="btn-gold px-8">Update Numbers</Link>
          </div>
        </div>
        
        <div className="glass p-10 rounded-[2.5rem] bg-emerald-primary text-white relative overflow-hidden">
          <div className="absolute bottom-0 right-0 opacity-10 -mb-10 -mr-10">
            <Moon size={150} />
          </div>
          <h2 className="text-2xl font-islamic font-bold mb-4">Pro Tip</h2>
          <p className="text-white/70 leading-relaxed">
            Regularly export your submissions to CSV for your personal records. Approved submissions appear instantly on the public wall.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white p-8 rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-neutral-100 flex items-center gap-8"
    >
      <div className={`p-5 rounded-2xl text-white shadow-lg ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-neutral-400 font-bold uppercase tracking-widest mb-1">{title}</p>
        <p className="text-3xl font-black text-neutral-900 tracking-tighter">{value}</p>
      </div>
    </motion.div>
  );
}

function Submissions({ fetchWithAuth }: { fetchWithAuth: any }) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const loadSubmissions = () => {
    fetchWithAuth('/api/admin/submissions').then((res: any) => res.json()).then(setSubmissions);
  };

  useEffect(() => {
    loadSubmissions();

    socket.on('new_submission', loadSubmissions);
    socket.on('submissions_updated', loadSubmissions);

    return () => {
      socket.off('new_submission');
      socket.off('submissions_updated');
    };
  }, []);

  const handleStatus = async (id: number, status: string) => {
    await fetchWithAuth(`/api/admin/submissions/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    toast.success(`Submission ${status}`, { icon: status === 'approved' ? '✅' : '❌' });
    loadSubmissions();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;
    await fetchWithAuth(`/api/admin/submissions/${id}`, { method: 'DELETE' });
    toast.success('Submission deleted');
    loadSubmissions();
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Amount', 'Method', 'Transaction ID', 'Message', 'Status', 'Date'];
    const rows = submissions.map(s => [
      s.sender_name,
      s.amount,
      s.payment_method,
      s.transaction_id,
      s.message || '',
      s.status,
      new Date(s.created_at).toLocaleString()
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "eid_salami_submissions.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-islamic font-bold text-emerald-primary">Submissions</h1>
        <button onClick={exportToCSV} className="btn-primary py-3 px-6 text-sm">
          <Download size={18} />
          Export Data
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-neutral-200/50 border border-neutral-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-neutral-50/50 border-b border-neutral-100">
              <tr>
                <th className="px-8 py-6 text-xs font-black text-neutral-400 uppercase tracking-widest">Sender</th>
                <th className="px-8 py-6 text-xs font-black text-neutral-400 uppercase tracking-widest">Amount</th>
                <th className="px-8 py-6 text-xs font-black text-neutral-400 uppercase tracking-widest">Method</th>
                <th className="px-8 py-6 text-xs font-black text-neutral-400 uppercase tracking-widest">Transaction</th>
                <th className="px-8 py-6 text-xs font-black text-neutral-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-xs font-black text-neutral-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-neutral-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="font-bold text-neutral-900 text-lg">{sub.sender_name}</div>
                    <div className="text-xs text-neutral-400 font-medium">{new Date(sub.created_at).toLocaleString()}</div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xl font-black text-emerald-primary tracking-tighter">৳{sub.amount}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                      sub.payment_method === 'bkash' ? 'bg-[#D12053]/10 text-[#D12053]' : 'bg-[#F7941D]/10 text-[#F7941D]'
                    }`}>
                      {sub.payment_method}
                    </span>
                  </td>
                  <td className="px-8 py-6 font-mono text-xs text-neutral-500 font-medium">{sub.transaction_id}</td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest ${
                      sub.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                      sub.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      {sub.status === 'pending' && (
                        <>
                          <button onClick={() => handleStatus(sub.id, 'approved')} className="w-10 h-10 flex items-center justify-center text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded-xl transition-all" title="Approve">
                            <Check size={20} />
                          </button>
                          <button onClick={() => handleStatus(sub.id, 'rejected')} className="w-10 h-10 flex items-center justify-center text-orange-600 bg-orange-50 hover:bg-orange-600 hover:text-white rounded-xl transition-all" title="Reject">
                            <X size={20} />
                          </button>
                        </>
                      )}
                      <button onClick={() => handleDelete(sub.id)} className="w-10 h-10 flex items-center justify-center text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-xl transition-all" title="Delete">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Settings({ fetchWithAuth }: { fetchWithAuth: any }) {
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/settings').then(res => res.json()).then(setSettings);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetchWithAuth('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });
      toast.success('Platform updated successfully!', { icon: '✨' });
    } catch (err) {
      toast.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  if (!settings) return <div className="animate-pulse p-10 glass rounded-[3rem] h-96" />;

  return (
    <div className="space-y-10">
      <h1 className="text-4xl font-islamic font-bold text-emerald-primary">Platform Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="glass p-10 rounded-[3rem] space-y-6">
            <h2 className="text-2xl font-islamic font-bold flex items-center gap-3 text-emerald-primary">
              <Wallet size={24} className="text-gold-primary" />
              Payment Gateway
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2">bKash Number</label>
                <input 
                  type="text" 
                  value={settings.bkash_number} 
                  onChange={e => setSettings({...settings, bkash_number: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl border border-neutral-100 focus:ring-2 focus:ring-emerald-primary/20 outline-none bg-neutral-50/50 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2">Nagad Number</label>
                <input 
                  type="text" 
                  value={settings.nagad_number} 
                  onChange={e => setSettings({...settings, nagad_number: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl border border-neutral-100 focus:ring-2 focus:ring-emerald-primary/20 outline-none bg-neutral-50/50 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="glass p-10 rounded-[3rem] space-y-6">
            <h2 className="text-2xl font-islamic font-bold flex items-center gap-3 text-emerald-primary">
              <Wallet size={24} className="text-gold-primary" />
              Bank Details (For Expatriates)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2">Bank Name</label>
                <input 
                  type="text" 
                  value={settings.bank_name} 
                  onChange={e => setSettings({...settings, bank_name: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl border border-neutral-100 focus:ring-2 focus:ring-emerald-primary/20 outline-none bg-neutral-50/50"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2">Account Name</label>
                <input 
                  type="text" 
                  value={settings.account_name} 
                  onChange={e => setSettings({...settings, account_name: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl border border-neutral-100 focus:ring-2 focus:ring-emerald-primary/20 outline-none bg-neutral-50/50"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2">Account Number</label>
                <input 
                  type="text" 
                  value={settings.account_number} 
                  onChange={e => setSettings({...settings, account_number: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl border border-neutral-100 focus:ring-2 focus:ring-emerald-primary/20 outline-none bg-neutral-50/50 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2">Routing Number</label>
                <input 
                  type="text" 
                  value={settings.routing_number} 
                  onChange={e => setSettings({...settings, routing_number: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl border border-neutral-100 focus:ring-2 focus:ring-emerald-primary/20 outline-none bg-neutral-50/50 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2">Branch Name</label>
                <input 
                  type="text" 
                  value={settings.branch_name} 
                  onChange={e => setSettings({...settings, branch_name: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl border border-neutral-100 focus:ring-2 focus:ring-emerald-primary/20 outline-none bg-neutral-50/50"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2">SWIFT Code</label>
                <input 
                  type="text" 
                  value={settings.swift_code} 
                  onChange={e => setSettings({...settings, swift_code: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl border border-neutral-100 focus:ring-2 focus:ring-emerald-primary/20 outline-none bg-neutral-50/50 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="glass p-10 rounded-[3rem] space-y-6">
            <h2 className="text-2xl font-islamic font-bold flex items-center gap-3 text-emerald-primary">
              <Home size={24} className="text-gold-primary" />
              Hero Content
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2">Main Title</label>
                <input 
                  type="text" 
                  value={settings.hero_title} 
                  onChange={e => setSettings({...settings, hero_title: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl border border-neutral-100 focus:ring-2 focus:ring-emerald-primary/20 outline-none bg-neutral-50/50"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2">Hero Message</label>
                <textarea 
                  rows={3}
                  value={settings.hero_message} 
                  onChange={e => setSettings({...settings, hero_message: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl border border-neutral-100 focus:ring-2 focus:ring-emerald-primary/20 outline-none bg-neutral-50/50 resize-none font-serif italic"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="glass p-10 rounded-[3rem] space-y-6">
          <h2 className="text-2xl font-islamic font-bold flex items-center gap-3 text-emerald-primary">
            <MessageSquare size={24} className="text-gold-primary" />
            About Siam Message
          </h2>
          <textarea 
            rows={4}
            value={settings.about_message} 
            onChange={e => setSettings({...settings, about_message: e.target.value})}
            className="w-full px-5 py-4 rounded-2xl border border-neutral-100 focus:ring-2 focus:ring-emerald-primary/20 outline-none bg-neutral-50/50 resize-none font-serif italic text-lg"
          />
        </div>

        <div className="flex justify-end">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
            type="submit" 
            className="btn-gold px-16 py-5 text-xl shadow-2xl"
          >
            {loading ? 'Processing...' : 'Save All Changes'}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
