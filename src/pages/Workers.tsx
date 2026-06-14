import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { ShieldCheck, Plus, Trash2, X, Check, Eye, EyeOff, Edit2 } from 'lucide-react';
import { navItems } from '../components/Navigation';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import toast from 'react-hot-toast';
import firebaseConfig from '../../firebase-applet-config.json';

// To avoid logging out the current admin, we create a temporary secondary Firebase app instance

export function Workers() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [editingWorker, setEditingWorker] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'workers'), (snapshot) => {
      setWorkers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const togglePermission = (id: string) => {
    setSelectedPermissions(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingWorker) {
      if (!name || selectedPermissions.length === 0) {
        toast.error('Please fill name and select at least one permission.');
        return;
      }
      setLoading(true);
      try {
        await setDoc(doc(db, 'workers', editingWorker.id), {
          name,
          permissions: selectedPermissions,
        }, { merge: true });

        await setDoc(doc(db, 'users', editingWorker.id), {
          name,
        }, { merge: true });

        toast.success('Worker updated successfully!');
        setIsModalOpen(false);
        setEditingWorker(null);
      } catch (error: any) {
        console.error('Error updating worker:', error);
        toast.error(error.message || 'Failed to update worker');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!name || !email || !password || selectedPermissions.length === 0) {
      toast.error('Please fill all fields and select at least one permission.');
      return;
    }

    setLoading(true);
    let secondaryApp;
    try {
      // 1. Initialize Secondary Firebase App
      secondaryApp = initializeApp(firebaseConfig, 'SecondaryApp');
      const secondaryAuth = getAuth(secondaryApp);

      // 2. Create the user in Auth
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const newUserId = userCredential.user.uid;

      // 3. Store their details and permissions in Firestore using primary db (as Admin)
      await setDoc(doc(db, 'workers', newUserId), {
        name,
        email,
        permissions: selectedPermissions,
        createdAt: serverTimestamp(),
      });

      // 4. Also create a valid user profile document for them
      await setDoc(doc(db, 'users', newUserId), {
        uid: newUserId,
        name,
        email,
        role: 'staff',
        createdAt: serverTimestamp()
      });

      toast.success('Worker created successfully!');
      
      // Reset Form
      setName('');
      setEmail('');
      setPassword('');
      setSelectedPermissions([]);
      setIsModalOpen(false);

    } catch (error: any) {
      console.error('Error creating worker:', error);
      toast.error(error.message || 'Failed to create worker');
    } finally {
      // 5. Clean up the secondary app instance
      if (secondaryApp) {
        await deleteApp(secondaryApp);
      }
      setLoading(false);
    }
  };

  const handleDeleteWorker = async (workerId: string) => {
    if (window.confirm('Are you sure you want to remove this worker\'s access? (This will permanently revoke their permissions)')) {
      try {
        await deleteDoc(doc(db, 'workers', workerId));
        toast.success('Worker access revoked.');
      } catch (error: any) {
        toast.error('Failed to remove worker');
      }
    }
  };

  const handleEditClick = (worker: any) => {
    setEditingWorker(worker);
    setName(worker.name);
    setEmail(worker.email);
    setSelectedPermissions(worker.permissions || []);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingWorker(null);
    setName('');
    setEmail('');
    setPassword('');
    setSelectedPermissions([]);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-indigo-600" />
            Staff Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage worker access and permissions</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span className="font-semibold">Add Worker</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workers.map(worker => (
          <div key={worker.id} className="bg-white dark:bg-[#18181b] rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-zinc-800">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{worker.name}</h3>
                <p className="text-sm text-slate-500">{worker.email}</p>
              </div>
              <div className="flex items-center space-x-1">
                <button 
                  onClick={() => handleEditClick(worker)}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-colors"
                  title="Edit permissions"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleDeleteWorker(worker.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                  title="Revoke access"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2 mt-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Permissions</p>
              <div className="flex flex-wrap gap-2">
                {worker.permissions?.map((permId: string) => {
                  const navItem = navItems.find(item => item.id === permId);
                  return navItem ? (
                    <span key={permId} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-bold">
                      <navItem.icon className="w-3.5 h-3.5" />
                      {navItem.label}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        ))}
        {workers.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400">
            No workers added yet.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-zinc-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingWorker ? 'Edit Worker Permissions' : 'Add New Worker'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddWorker} className="p-6 overflow-y-auto max-h-[75vh]">
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Worker Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#18181b] outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 dark:text-white"
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
                  <input
                    type="email"
                    required={!editingWorker}
                    disabled={!!editingWorker}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#18181b] outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 dark:text-white disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-800"
                    placeholder="worker@example.com"
                  />
                </div>
                {!editingWorker && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#18181b] outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 dark:text-white pr-10"
                        placeholder="Enter password"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-8">
                <label className="block text-sm font-bold text-slate-900 dark:text-white mb-4">Select Allowed Menus</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {navItems.map((item) => {
                    // Do not allow assigning Staff Management to a worker
                    if (item.id === 'workers') return null;
                    const isSelected = selectedPermissions.includes(item.id);
                    return (
                      <div 
                        key={item.id}
                        onClick={() => togglePermission(item.id)}
                        className={`flex items-center space-x-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:border-indigo-500' 
                            : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#18181b] hover:border-indigo-300'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-zinc-700'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <item.icon className={`w-5 h-5 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`} />
                        <span className={`text-sm font-semibold ${isSelected ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-600 dark:text-zinc-400'}`}>
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 flex items-center justify-center space-x-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors disabled:opacity-70"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>{editingWorker ? 'Update Worker Details' : 'Create Worker Account'}</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
