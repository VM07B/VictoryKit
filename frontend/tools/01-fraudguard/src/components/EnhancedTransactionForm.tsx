import React, { useState, useEffect } from 'react';
import {
  Send,
  CreditCard,
  User,
  MapPin,
  Smartphone,
  Zap,
  Shuffle,
  AlertCircle,
  CheckCircle,
  Globe,
  Mail,
  Wifi,
  Fingerprint,
  Building,
  DollarSign,
  Loader2,
  Sparkles,
  Shield,
} from 'lucide-react';

interface EnhancedTransactionFormProps {
  onAnalyze: (data: any) => void;
  loading?: boolean;
}

// Animated Input Component
const AnimatedInput: React.FC<{
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  maxLength?: number;
  className?: string;
}> = ({ label, icon, value, onChange, placeholder, type = 'text', required, maxLength, className }) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div className={`relative ${className}`}>
      <label className={`block text-sm mb-2 transition-colors ${
        isFocused ? 'text-red-400' : 'text-gray-400'
      }`}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
          isFocused ? 'text-red-400' : 'text-gray-500'
        }`}>
          {icon}
        </div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          maxLength={maxLength}
          className={`w-full bg-slate-900/50 border rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-gray-600 transition-all ${
            isFocused
              ? 'border-red-500 ring-2 ring-red-500/20'
              : 'border-slate-700/50 hover:border-slate-600'
          }`}
          placeholder={placeholder}
          required={required}
        />
        {value && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <CheckCircle className="w-4 h-4 text-green-500" />
          </div>
        )}
      </div>
    </div>
  );
};

// Currency Select Component
const CurrencySelect: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => (
  <div className="relative">
    <label className="block text-sm text-gray-400 mb-2">Currency</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-3 text-white appearance-none cursor-pointer hover:border-slate-600 transition-colors"
    >
      {[
        { code: 'USD', symbol: '$', name: 'US Dollar' },
        { code: 'EUR', symbol: '€', name: 'Euro' },
        { code: 'GBP', symbol: '£', name: 'British Pound' },
        { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
        { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
        { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
      ].map((currency) => (
        <option key={currency.code} value={currency.code}>
          {currency.symbol} {currency.code}
        </option>
      ))}
    </select>
    <div className="absolute right-3 bottom-3 pointer-events-none">
      <DollarSign className="w-5 h-5 text-gray-500" />
    </div>
  </div>
);

// Section Header Component
const SectionHeader: React.FC<{
  icon: React.ReactNode;
  title: string;
  color: string;
}> = ({ icon, title, color }) => (
  <div className={`flex items-center gap-2 mb-4 pb-2 border-b border-${color}-500/20`}>
    <div className={`w-8 h-8 rounded-lg bg-${color}-500/20 flex items-center justify-center`}>
      <div className={`text-${color}-400`}>{icon}</div>
    </div>
    <span className={`text-sm font-bold text-${color}-400 uppercase tracking-wide`}>{title}</span>
  </div>
);

export const EnhancedTransactionForm: React.FC<EnhancedTransactionFormProps> = ({ onAnalyze, loading }) => {
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
    city: '',
  });

  const [isFormValid, setIsFormValid] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const isValid = formData.transaction_id && formData.amount && parseFloat(formData.amount) > 0;
    setIsFormValid(isValid);
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze({
      ...formData,
      amount: parseFloat(formData.amount),
      timestamp: new Date().toISOString(),
    });
  };

  const generateTransactionId = () => {
    const id = 'TX-' + Date.now().toString(36).toUpperCase() + '-' + 
               Math.random().toString(36).substring(2, 6).toUpperCase();
    setFormData({ ...formData, transaction_id: id });
  };

  const generateRandomData = () => {
    const countries = ['United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Japan'];
    const cities = ['New York', 'Toronto', 'London', 'Berlin', 'Paris', 'Tokyo'];
    const randomIndex = Math.floor(Math.random() * countries.length);
    
    setFormData({
      transaction_id: 'TX-' + Date.now().toString(36).toUpperCase() + '-' + 
                      Math.random().toString(36).substring(2, 6).toUpperCase(),
      amount: (Math.random() * 10000 + 100).toFixed(2),
      currency: ['USD', 'EUR', 'GBP'][Math.floor(Math.random() * 3)],
      user_ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      device_fingerprint: Math.random().toString(36).substring(2, 14).toUpperCase(),
      email: `user${Math.floor(Math.random() * 9999)}@example.com`,
      card_last4: String(Math.floor(1000 + Math.random() * 9000)),
      merchant_id: 'MERCH-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      country: countries[randomIndex],
      city: cities[randomIndex],
    });
  };

  const updateField = (field: string) => (value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="bg-slate-800/30 backdrop-blur rounded-xl border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 px-6 py-4 border-b border-red-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-lg shadow-red-500/25">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Analyze Transaction</h2>
              <p className="text-sm text-gray-400">Enter transaction details for fraud analysis</p>
            </div>
          </div>
          <button
            type="button"
            onClick={generateRandomData}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-gray-400 hover:text-white hover:border-slate-600 transition-all"
          >
            <Shuffle className="w-4 h-4" />
            <span className="text-sm">Demo Data</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Transaction ID & Amount */}
        <div className="space-y-4">
          <SectionHeader 
            icon={<CreditCard className="w-4 h-4" />} 
            title="Transaction Details" 
            color="red" 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Transaction ID */}
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-2">
                Transaction ID <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={formData.transaction_id}
                    onChange={(e) => updateField('transaction_id')(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-gray-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                    placeholder="TX-001234ABC"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={generateTransactionId}
                  className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors whitespace-nowrap"
                >
                  <Zap className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Card Last 4 */}
            <AnimatedInput
              label="Card Last 4"
              icon={<CreditCard className="w-4 h-4" />}
              value={formData.card_last4}
              onChange={(value) => updateField('card_last4')(value.replace(/\D/g, ''))}
              placeholder="1234"
              maxLength={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Amount */}
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-2">
                Amount <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <DollarSign className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => updateField('amount')(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-gray-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all text-lg font-medium"
                  placeholder="1,500.00"
                  required
                />
              </div>
            </div>
            
            {/* Currency */}
            <CurrencySelect
              value={formData.currency}
              onChange={updateField('currency')}
            />
          </div>
        </div>

        {/* User Information */}
        <div className="space-y-4">
          <SectionHeader 
            icon={<User className="w-4 h-4" />} 
            title="User Information" 
            color="blue" 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatedInput
              label="Email Address"
              icon={<Mail className="w-4 h-4" />}
              value={formData.email}
              onChange={updateField('email')}
              placeholder="user@example.com"
              type="email"
            />
            
            <AnimatedInput
              label="IP Address"
              icon={<Wifi className="w-4 h-4" />}
              value={formData.user_ip}
              onChange={updateField('user_ip')}
              placeholder="192.168.1.1"
            />
          </div>
        </div>

        {/* Device & Merchant */}
        <div className="space-y-4">
          <SectionHeader 
            icon={<Smartphone className="w-4 h-4" />} 
            title="Device & Merchant" 
            color="purple" 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatedInput
              label="Device Fingerprint"
              icon={<Fingerprint className="w-4 h-4" />}
              value={formData.device_fingerprint}
              onChange={updateField('device_fingerprint')}
              placeholder="a1b2c3d4e5f6"
            />
            
            <AnimatedInput
              label="Merchant ID"
              icon={<Building className="w-4 h-4" />}
              value={formData.merchant_id}
              onChange={updateField('merchant_id')}
              placeholder="MERCHANT_001"
            />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-4">
          <SectionHeader 
            icon={<MapPin className="w-4 h-4" />} 
            title="Location" 
            color="green" 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatedInput
              label="Country"
              icon={<Globe className="w-4 h-4" />}
              value={formData.country}
              onChange={updateField('country')}
              placeholder="United States"
            />
            
            <AnimatedInput
              label="City"
              icon={<MapPin className="w-4 h-4" />}
              value={formData.city}
              onChange={updateField('city')}
              placeholder="New York"
            />
          </div>
        </div>

        {/* Validation Status */}
        <div className={`flex items-center gap-2 p-3 rounded-lg ${
          isFormValid ? 'bg-green-500/10 border border-green-500/20' : 'bg-yellow-500/10 border border-yellow-500/20'
        }`}>
          {isFormValid ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-sm text-green-400">Form is ready for submission</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-yellow-400">Please fill in required fields (Transaction ID, Amount)</span>
            </>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !isFormValid}
          className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 group"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Initializing Analysis...</span>
            </>
          ) : (
            <>
              <Shield className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Start Fraud Analysis</span>
              <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default EnhancedTransactionForm;
