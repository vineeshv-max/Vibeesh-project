import React, { useState } from 'react';
import {
  ShieldAlert,
  Lock,
  User,
  Eye,
  EyeOff,
  X,
  CheckCircle2,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const { login } = useAdminAuth();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const result = login(username, password);
      setIsSubmitting(false);

      if (result.success) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setPassword('');
          onClose();
          if (onLoginSuccess) {
            onLoginSuccess();
          }
        }, 600);
      } else {
        setErrorMessage(result.error || 'Authentication failed. Please verify credentials.');
      }
    }, 300);
  };

  const handleQuickFill = () => {
    setUsername('admin');
    setPassword('admin');
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#12141d] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Glow ambient background accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="relative p-6 pb-4 border-b border-white/5 flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border border-purple-500/30 shadow-lg shadow-purple-950/50 bg-black shrink-0">
              <img src="/logo.jpeg" alt="VIBEESH Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300">
                  Restricted
                </span>
                <span className="text-xs text-zinc-400">VIBEESH Portal</span>
              </div>
              <h3 className="text-lg font-black text-white mt-0.5 tracking-tight">
                Administrator Sign In
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content & Form */}
        <div className="p-6 space-y-5">
          <p className="text-xs text-zinc-400 leading-relaxed">
            Provider configurations, Jamendo streaming API credentials, and cache management are restricted to authorized administrators.
          </p>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Banner */}
          {isSuccess && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Authentication verified. Unlocking Administrator settings...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-purple-400" /> Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter administrator username"
                  className="w-full pl-3.5 pr-4 py-2.5 rounded-xl bg-[#0b0d13] border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-purple-400" /> Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-[#0b0d13] border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Quick Demo Helper */}
            <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-zinc-300">
                <KeyRound className="w-4 h-4 text-purple-400 shrink-0" />
                <span>
                  Default login: <code className="text-purple-300 font-mono">admin</code> / <code className="text-purple-300 font-mono">admin</code>
                </span>
              </div>
              <button
                type="button"
                onClick={handleQuickFill}
                className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors shrink-0 ml-2"
              >
                Auto-fill
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || isSuccess}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:via-indigo-500 hover:to-purple-600 shadow-lg shadow-purple-900/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Authenticated!</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  <span>Authenticate & Open Settings</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
