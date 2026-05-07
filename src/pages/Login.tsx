import { useState, useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, getDocFromServer } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate, Navigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Leaf, Lock, User as UserIcon, Wifi, WifiOff, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';

export function Login() {
  const { user, setCurrentCustomerPage, setPortal, urlMode } = useStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [connectionOk, setConnectionOk] = useState<boolean | null>(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const checkConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        setConnectionOk(true);
      } catch (err) {
        console.warn("Connection check failed:", err);
        setConnectionOk(false);
      }
    };
    checkConnection();
  }, []);

  if (user) {
    if (urlMode === 'standard') setPortal('admin');
    const target = urlMode === 'static' ? '/logesh-vivasayi/admin/dashboard' : '/';
    return <Navigate to={target} replace />;
  }

  const handleCredentialAuth = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Support both plain username and email
      const email = username.includes('@') ? username : `${username}@billing.com`;

      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;

      if (urlMode === 'standard') setPortal('admin');
      const target = urlMode === 'static' ? '/logesh-vivasayi/admin/dashboard' : '/';
      navigate(target);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid username or password. Please contact the administrator for access.');
      } else {
        setError(err.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 text-slate-900 dark:text-white transition-colors relative overflow-hidden">

      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      <button
        onClick={() => {
          navigate(urlMode === 'static' ? '/logesh-vivasayi/home' : '/');
        }}
        className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center space-x-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors z-20 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="hidden sm:inline">Back to Site</span>
      </button>

      <div className="w-full max-w-md bg-white dark:bg-[#18181b] rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-zinc-800 p-8 sm:p-10 relative z-10 animate-in fade-in zoom-in-95 duration-500">

        {/* Header */}
        <div className="text-center space-y-6 mb-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Leaf className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Authorized Access</h1>
            <p className="text-sm text-slate-500 mt-1">Sign in to manage your business</p>
          </div>

          <div className="flex items-center justify-center">
            {connectionOk === null ? (
              <div className="flex items-center space-x-2 text-slate-400">
                <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600 animate-pulse" />
                <span className="text-xs font-medium">Checking connection...</span>
              </div>
            ) : connectionOk ? (
              <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Wifi className="h-3 w-3" />
                <span className="text-xs font-semibold">System Online</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400">
                <WifiOff className="h-3 w-3" />
                <span className="text-xs font-semibold">Offline Mode</span>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 animate-in slide-in-from-top-2">
            <p className="text-sm font-medium text-red-600 dark:text-red-400 text-center">
              {error}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleCredentialAuth} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Username / Email</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full h-11 pl-9 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 pl-9 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 flex items-center justify-center rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium italic">
            This is a restricted area. Unauthorized access is prohibited.
          </p>
        </div>
      </div>
    </div>
  );
}
