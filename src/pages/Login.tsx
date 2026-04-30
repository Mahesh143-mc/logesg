import { useState, useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, getDocFromServer } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate, Navigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Leaf, Lock, User as UserIcon, Wifi, WifiOff, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';

export function Login() {
  const { user, setCurrentCustomerPage } = useStore();
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
    return <Navigate to="/" replace />;
  }

  const handleCredentialAuth = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const email = username.includes('@') ? username : `${username}@billing.com`;
      
      let result;
      if (isSignUp) {
        result = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        result = await signInWithEmailAndPassword(auth, email, password);
      }
      
      const user = result.user;

      const profileRef = doc(db, 'users', user.uid);
      const profileSnap = await getDoc(profileRef);

      if (!profileSnap.exists()) {
        await setDoc(profileRef, {
          uid: user.uid,
          email: user.email,
          displayName: username,
          role: 'admin',
          createdAt: serverTimestamp(),
        });
      }
      navigate('/');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/configuration-not-found') {
        setError(`Error: Email/Password ${isSignUp ? 'registration' : 'login'} is not enabled in your Firebase Console.`);
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid username or password. If you haven\'t created an account yet, switch to "Sign Up" below.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This username/email is already registered. Please Sign In instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(err.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const profileRef = doc(db, 'users', user.uid);
      const profileSnap = await getDoc(profileRef);

      if (!profileSnap.exists()) {
        await setDoc(profileRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: 'staff',
          createdAt: serverTimestamp(),
        });
      }
      navigate('/');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/configuration-not-found') {
        setError('Google Auth is not enabled in Firebase Console. Please enable it in the Authentication tab.');
      } else {
        setError(err.message || 'Failed to login');
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
          navigate('/');
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
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Admin Login</h1>
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
              <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white dark:bg-[#18181b] px-4 text-slate-500">Or continue with</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full h-11 flex items-center justify-center space-x-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="h-4 w-4" />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Google</span>
        </button>
      </div>
    </div>
  );
}
