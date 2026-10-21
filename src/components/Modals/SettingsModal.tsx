import React, { useState } from 'react';
import {
  X,
  Settings,
  ShieldCheck,
  ShieldAlert,
  Key,
  Database,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Activity,
  HelpCircle,
  LogOut,
  Lock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { MusicService } from '../../services/MusicService';
import { JamendoProvider } from '../../services/JamendoProvider';
import { useAdminAuth } from '../../context/AdminAuthContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenLogin,
}) => {
  const { isAdmin, adminSession, logout, changePassword } = useAdminAuth();

  const [jamendoKey, setJamendoKey] = useState(JamendoProvider.getClientId());
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ isValid: boolean; message: string } | null>(null);
  const [testing, setTesting] = useState(false);

  // Change Password state
  const [isChangePassOpen, setIsChangePassOpen] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);

  const providerStatuses = MusicService.getProviderStatuses();

  if (!isOpen) return null;

  const handleSaveJamendo = (e: React.FormEvent) => {
    e.preventDefault();
    JamendoProvider.setClientId(jamendoKey);
    setSaveMessage('Jamendo Client ID saved to local storage!');
    setTestResult(null);
    setTimeout(() => setSaveMessage(null), 3500);
  };

  const handleTestJamendo = async () => {
    setTesting(true);
    setTestResult(null);
    const res = await JamendoProvider.testCredentials(jamendoKey);
    setTestResult(res);
    setTesting(false);
  };

  const handleClearCache = () => {
    localStorage.removeItem('vibeesh_library_data_v1');
    localStorage.removeItem('vibeesh_jamendo_client_id');
    localStorage.removeItem('vibeesh_player_volume');
    localStorage.removeItem('melodyverse_library_data_v1');
    localStorage.removeItem('melodyverse_jamendo_client_id');
    localStorage.removeItem('melodyverse_player_volume');
    setSaveMessage('Local cache and library reset to default.');
    setTimeout(() => {
      setSaveMessage(null);
      window.location.reload();
    }, 1000);
  };

  const handleLogoutAdmin = () => {
    logout();
    onClose();
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    const res = changePassword(currentPass, newPass);
    if (res.success) {
      setPassSuccess('Administrator password updated successfully.');
      setCurrentPass('');
      setNewPass('');
      setTimeout(() => {
        setPassSuccess(null);
        setIsChangePassOpen(false);
      }, 2000);
    } else {
      setPassError(res.error || 'Failed to update password.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#141620] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">VIBEESH Admin Settings</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300">
                  ADMIN ONLY
                </span>
              </div>
              <p className="text-xs text-zinc-400">Manage audio streaming sources and API configurations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Guard for Non-Admin */}
        {!isAdmin ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-white">Administrator Access Required</h4>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Provider settings and Jamendo API configurations are restricted to administrators. Please log in with your admin credentials to continue.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => {
                  onClose();
                  if (onOpenLogin) onOpenLogin();
                }}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/30 transition-all hover:scale-105"
              >
                Sign In as Administrator
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {saveMessage && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {saveMessage}
              </div>
            )}

            {/* Administrator Active Session Banner */}
            <section className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-[#181524] to-[#141620] border border-purple-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Admin Session Active</span>
                    <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      AUTHORIZED
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Signed in as <code className="text-purple-300 font-mono">{adminSession?.username || 'admin'}</code>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setIsChangePassOpen(!isChangePassOpen)}
                  className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[11px] text-zinc-300 hover:text-white transition-colors flex items-center gap-1 border border-white/5"
                >
                  <span>Change Password</span>
                  {isChangePassOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                <button
                  type="button"
                  onClick={handleLogoutAdmin}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-[11px] font-medium transition-colors flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </section>

            {/* Change Password Collapsible Section */}
            {isChangePassOpen && (
              <form onSubmit={handleChangePassword} className="p-4 rounded-2xl bg-[#191b26] border border-purple-500/30 space-y-3 animate-fadeIn">
                <h5 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" /> Update Administrator Password
                </h5>

                {passError && (
                  <div className="p-2.5 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{passError}</span>
                  </div>
                )}

                {passSuccess && (
                  <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{passSuccess}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Current Password</label>
                    <input
                      type="password"
                      required
                      value={currentPass}
                      onChange={(e) => setCurrentPass(e.target.value)}
                      placeholder="Current password"
                      className="w-full px-3 py-1.5 rounded-xl bg-[#0e1017] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">New Password</label>
                    <input
                      type="password"
                      required
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      placeholder="New password (min 4 chars)"
                      className="w-full px-3 py-1.5 rounded-xl bg-[#0e1017] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsChangePassOpen(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow"
                  >
                    Save New Password
                  </button>
                </div>
              </form>
            )}

            {/* Connected Providers Status */}
            <section className="space-y-3">
              <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Connected Provider Status
              </h4>

              <div className="space-y-2.5">
                {providerStatuses.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-2xl bg-[#191b26] border border-white/5 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">{p.name}</span>
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                          p.status === 'active'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {p.badgeText}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">{p.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Jamendo Client ID Configuration & Registration Guide */}
            <section className="p-4 rounded-2xl bg-[#191b26] border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                  <Key className="w-4 h-4 text-purple-400" />
                  Jamendo API Configuration (Playable CC Music)
                </h4>
                <a
                  href="https://developer.jamendo.com/v3.0"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 hover:underline"
                >
                  Developer Portal <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Step by step registration guide */}
              <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs text-zinc-300 space-y-2">
                <p className="font-semibold text-purple-300 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5" /> How to register for your free Jamendo Client ID:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-zinc-400 pl-1">
                  <li>Go to <a href="https://developer.jamendo.com/v3.0" target="_blank" rel="noreferrer" className="text-purple-400 underline">developer.jamendo.com</a> and create a free account.</li>
                  <li>Click <strong>My Applications</strong> &rarr; <strong>New Application</strong>.</li>
                  <li>Enter Application Name (e.g. <code>VIBEESH</code>) and submit.</li>
                  <li>Copy the generated <strong>Client ID</strong> and paste it into the field below.</li>
                </ol>
              </div>

              <form onSubmit={handleSaveJamendo} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={jamendoKey}
                    onChange={(e) => setJamendoKey(e.target.value)}
                    placeholder="Paste your Jamendo Client ID here..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-[#0e1017] border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={handleTestJamendo}
                    disabled={testing || !jamendoKey.trim()}
                    className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 text-xs font-semibold rounded-xl transition-colors shrink-0 flex items-center gap-1.5"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    {testing ? 'Testing...' : 'Test Key'}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl transition-colors shrink-0"
                  >
                    Save Key
                  </button>
                </div>

                {/* Real-time test result */}
                {testResult && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                      testResult.isValid
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    {testResult.isValid ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </form>
            </section>

            {/* MusicBrainz Client Information */}
            <section className="p-4 rounded-2xl bg-[#191b26] border border-white/5 space-y-2 text-xs text-zinc-400">
              <h4 className="font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                MusicBrainz Client (Borewit/musicbrainz-api)
              </h4>
              <p className="leading-relaxed">
                Powered by the official <code>musicbrainz-api</code> package with built-in rate-limiting and user-agent attribution. Used for artist biographies, release groups, and recording metadata.
              </p>
            </section>

            {/* Data and Storage Controls */}
            <section className="p-4 rounded-2xl bg-[#191b26] border border-white/5 space-y-3">
              <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-400" />
                Local Storage & Cache
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                VIBEESH operates in Guest Mode for regular users. Administrators can reset cached artist entries and local storage records.
              </p>
              <button
                onClick={handleClearCache}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-rose-950/40 hover:text-rose-400 text-zinc-300 text-xs font-medium transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset Local Storage & Cache
              </button>
            </section>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-[#11131c] border-t border-white/5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
