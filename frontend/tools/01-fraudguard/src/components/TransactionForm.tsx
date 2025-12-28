import React, { useState } from 'react';
import { Send, CreditCard, User, MapPin, Smartphone } from 'lucide-react';

interface TransactionFormProps {
  onAnalyze: (data: any) => void;
  loading?: boolean;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ onAnalyze, loading }) => {
  const [formData, setFormData] = useState({
    transaction_id: '',
    amount: '',
    currency: 'USD',
    user_ip: '',
    device_fingerprint: '',
    email: '',
    card_last4: '',
    merchant_id: '',
    country: '',
    city: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze({
      ...formData,
      amount: parseFloat(formData.amount),
      timestamp: new Date().toISOString()
    });
  };

  const generateTransactionId = () => {
    const id = 'TX' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
    setFormData({ ...formData, transaction_id: id });
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-red-500/30 p-6">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-white" />
        </div>
        Analyze Transaction
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Transaction ID */}
        <div>
          <label className="block text-sm text-red-200 mb-2">Transaction ID *</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.transaction_id}
              onChange={(e) => setFormData({...formData, transaction_id: e.target.value})}
              className="flex-1 bg-slate-900/50 border border-red-500/30 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all"
              placeholder="TX001234ABC"
              required
            />
            <button
              type="button"
              onClick={generateTransactionId}
              className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 hover:bg-red-500/30 transition-colors text-sm"
            >
              Generate
            </button>
          </div>
        </div>

        {/* Amount & Currency */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <label className="block text-sm text-red-200 mb-2">Amount *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="w-full bg-slate-900/50 border border-red-500/30 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all"
              placeholder="1500.00"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-red-200 mb-2">Currency</label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({...formData, currency: e.target.value})}
              className="w-full bg-slate-900/50 border border-red-500/30 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="JPY">JPY</option>
              <option value="CAD">CAD</option>
              <option value="AUD">AUD</option>
            </select>
          </div>
        </div>
        
        {/* User Info Section */}
        <div className="border-t border-red-500/20 pt-4 mt-4">
          <h3 className="text-sm font-bold text-red-300 mb-3 flex items-center gap-2">
            <User className="w-4 h-4" /> User Information
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-red-200 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-slate-900/50 border border-red-500/30 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:border-red-500 focus:outline-none transition-all"
                placeholder="user@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm text-red-200 mb-2">IP Address</label>
              <input
                type="text"
                value={formData.user_ip}
                onChange={(e) => setFormData({...formData, user_ip: e.target.value})}
                className="w-full bg-slate-900/50 border border-red-500/30 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:border-red-500 focus:outline-none transition-all"
                placeholder="192.168.1.1"
              />
            </div>
          </div>
        </div>

        {/* Device & Card Section */}
        <div className="border-t border-red-500/20 pt-4">
          <h3 className="text-sm font-bold text-red-300 mb-3 flex items-center gap-2">
            <Smartphone className="w-4 h-4" /> Device & Payment
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-red-200 mb-2">Device Fingerprint</label>
              <input
                type="text"
                value={formData.device_fingerprint}
                onChange={(e) => setFormData({...formData, device_fingerprint: e.target.value})}
                className="w-full bg-slate-900/50 border border-red-500/30 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:border-red-500 focus:outline-none transition-all"
                placeholder="a1b2c3d4e5f6"
              />
            </div>
            
            <div>
              <label className="block text-sm text-red-200 mb-2">Card Last 4</label>
              <input
                type="text"
                maxLength={4}
                value={formData.card_last4}
                onChange={(e) => setFormData({...formData, card_last4: e.target.value.replace(/\D/g, '')})}
                className="w-full bg-slate-900/50 border border-red-500/30 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:border-red-500 focus:outline-none transition-all"
                placeholder="1234"
              />
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="border-t border-red-500/20 pt-4">
          <h3 className="text-sm font-bold text-red-300 mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Location
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-red-200 mb-2">Country</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
                className="w-full bg-slate-900/50 border border-red-500/30 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:border-red-500 focus:outline-none transition-all"
                placeholder="United States"
              />
            </div>
            
            <div>
              <label className="block text-sm text-red-200 mb-2">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="w-full bg-slate-900/50 border border-red-500/30 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:border-red-500 focus:outline-none transition-all"
                placeholder="New York"
              />
            </div>
          </div>
        </div>

        {/* Merchant ID */}
        <div>
          <label className="block text-sm text-red-200 mb-2">Merchant ID</label>
          <input
            type="text"
            value={formData.merchant_id}
            onChange={(e) => setFormData({...formData, merchant_id: e.target.value})}
            className="w-full bg-slate-900/50 border border-red-500/30 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:border-red-500 focus:outline-none transition-all"
            placeholder="MERCHANT_001"
          />
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/25"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing Transaction...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Analyze Fraud Risk
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;
