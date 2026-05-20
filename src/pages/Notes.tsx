import React, { useState, useEffect, type ChangeEvent, type FormEvent, type DragEvent } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, Timestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import {
  Plus,
  Search,
  Trash2,
  StickyNote,
  Image as LucideImageIcon,
  X,
  Calendar,
  Save,
  FileText,
  Edit2
} from 'lucide-react';
import { format } from 'date-fns';
import { compressImage, uploadToCloudinary } from '../lib/imageUpload';
import { cn } from '../lib/utils';

interface Note {
  id: string;
  title: string;
  content: string;
  image?: string;
  createdAt: any;
}

export function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', image: '' });
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'notes'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotes(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Note)));
    });
    return unsubscribe;
  }, []);

  const handleAddNote = async (e: FormEvent) => {
    e.preventDefault();
    if (!newNote.title.trim() || !newNote.content.trim()) return;

    try {
      await addDoc(collection(db, 'notes'), {
        ...newNote,
        createdAt: Timestamp.now()
      });
      setNewNote({ title: '', content: '', image: '' });
      setIsAdding(false);
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notes', id));
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const processAndUploadImage = async (file: File, isEditing = false) => {
    try {
      setUploadStatus('Compressing...');
      const compressedFile = await compressImage(file);

      setUploadStatus('Uploading...');
      setUploadProgress(0);
      const result = await uploadToCloudinary(compressedFile, (progress) => {
        setUploadProgress(progress);
      }, 'notes');

      if (isEditing && editingNote) {
        setEditingNote({ ...editingNote, image: result.url });
      } else {
        setNewNote(prev => ({ ...prev, image: result.url }));
      }
      setUploadStatus('');
      setUploadProgress(0);
    } catch (error) {
      console.error('Error handling image:', error);
      alert('Failed to process and upload image.');
      setUploadStatus('');
      setUploadProgress(0);
    }
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>, isEditing = false) => {
    const file = e.target.files?.[0];
    if (file) {
      await processAndUploadImage(file, isEditing);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent, isEditing = false) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      await processAndUploadImage(file, isEditing);
    } else if (file) {
      alert('Please drop a valid image file.');
    }
  };

  const handleUpdateNote = async () => {
    if (!editingNote) return;
    try {
      await updateDoc(doc(db, 'notes', editingNote.id), {
        title: editingNote.title,
        content: editingNote.content,
        image: editingNote.image || ''
      });
      setEditingNote(null);
    } catch (error) {
      console.error("Error updating note:", error);
    }
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      <header className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Notes</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Capture strategy, observations, and key intelligence</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-zinc-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white shadow-sm"
            />
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="h-10 flex items-center justify-center space-x-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700 transition-all shadow-sm active:scale-95 whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Note</span>
          </button>
        </div>
      </header>

      {/* Grid of Notes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            className="group relative flex flex-col rounded-2xl bg-white dark:bg-[#18181b] shadow-sm border border-slate-200/60 dark:border-zinc-800 overflow-hidden cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-md transition-all duration-300"
            onClick={() => setSelectedNote(note)}
          >
            {note.image && (
              <div className="h-32 overflow-hidden border-b border-slate-100 dark:border-slate-800">
                <img
                  src={note.image}
                  alt={note.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            <div className="flex-1 p-5 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1 tracking-tight">{note.title}</h3>

                {/* Actions (visible on hover) */}
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-lg p-1 shadow-sm border border-slate-100 dark:border-slate-700">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingNote(note);
                    }}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIdToDelete(note.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed flex-1 whitespace-pre-wrap">
                {note.content}
              </p>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-medium text-slate-400">
                <div className="flex items-center space-x-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{note.createdAt ? format(note.createdAt.toDate(), 'MMM dd, yyyy') : 'Just now'}</span>
                </div>
                {note.image && (
                  <div className="flex items-center space-x-1.5 text-indigo-400">
                    <LucideImageIcon className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <div className="w-16 h-16 bg-slate-50 dark:bg-[#18181b] rounded-full flex items-center justify-center mb-4">
            <StickyNote className="h-8 w-8 opacity-50" />
          </div>
          <p className="text-sm font-medium">No notes found</p>
          <button
            onClick={() => setIsAdding(true)}
            className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Create your first note
          </button>
        </div>
      )}

      {/* Add Note Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            <form onSubmit={handleAddNote} className="flex flex-col h-full">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-slate-800/20">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create Note</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Title</label>
                  <input
                    required
                    type="text"
                    placeholder="Enter note title..."
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Content</label>
                  <textarea
                    required
                    rows={8}
                    placeholder="Write your note here..."
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none min-h-[200px] dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Image (Optional)</label>
                  {newNote.image ? (
                    <div className="relative rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800 h-48 group">
                      <img src={newNote.image} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                      <button
                        type="button"
                        onClick={() => setNewNote({ ...newNote, image: '' })}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-2">
                      <label
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, false)}
                        className={cn(
                          "flex flex-col items-center justify-center h-32 rounded-xl border-2 border-dashed transition-colors cursor-pointer group",
                          isDragging ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" : "border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center shadow-sm mb-2 transition-colors",
                          isDragging ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-800 dark:text-indigo-200" : "bg-white dark:bg-slate-700 text-slate-400 group-hover:text-indigo-500"
                        )}>
                          <LucideImageIcon className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-semibold text-slate-500">
                          {isDragging ? 'Drop to upload' : 'Click or drag image to upload'}
                        </span>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, false)} disabled={!!uploadStatus} />
                      </label>

                      {uploadStatus && (
                        <div className="w-full text-center space-y-1 mt-2">
                          <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 animate-pulse">{uploadStatus}</p>
                          {uploadProgress > 0 && uploadProgress < 100 && (
                            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-600 transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Note</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Note Modal */}
      {editingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-slate-800/20">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Edit Note</h2>
              </div>
              <button
                onClick={() => setEditingNote(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Title</label>
                <input
                  required
                  type="text"
                  value={editingNote.title}
                  onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                  className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Content</label>
                <textarea
                  required
                  rows={8}
                  value={editingNote.content}
                  onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none min-h-[200px] dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Image</label>
                {editingNote.image ? (
                  <div className="relative rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800 h-48 group">
                    <img src={editingNote.image} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    <button
                      onClick={() => setEditingNote({ ...editingNote, image: '' })}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <label
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, true)}
                      className={cn(
                        "flex flex-col items-center justify-center h-32 rounded-xl border-2 border-dashed transition-colors cursor-pointer group",
                        isDragging ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" : "border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center shadow-sm mb-2 transition-colors",
                        isDragging ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-800 dark:text-indigo-200" : "bg-white dark:bg-slate-700 text-slate-400 group-hover:text-indigo-500"
                      )}>
                        <LucideImageIcon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-semibold text-slate-500">
                        {isDragging ? 'Drop to upload' : 'Click or drag image to upload'}
                      </span>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, true)} disabled={!!uploadStatus} />
                    </label>

                    {uploadStatus && (
                      <div className="w-full text-center space-y-1 mt-2">
                        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 animate-pulse">{uploadStatus}</p>
                        {uploadProgress > 0 && uploadProgress < 100 && (
                          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-600 transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex justify-end space-x-3">
              <button
                onClick={() => setEditingNote(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateNote}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Note Modal */}
      {selectedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-slate-800/20">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{selectedNote.title}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedNote.createdAt ? format(selectedNote.createdAt.toDate(), 'MMMM dd, yyyy • hh:mm a') : 'Recently added'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedNote(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {selectedNote.image && (
                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <img
                    src={selectedNote.image}
                    alt={selectedNote.title}
                    className="w-full h-auto object-contain max-h-[400px]"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 whitespace-pre-wrap text-sm leading-relaxed">
                {selectedNote.content}
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setEditingNote(selectedNote);
                  setSelectedNote(null);
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center space-x-2"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => {
                  setIdToDelete(selectedNote.id);
                  setSelectedNote(null);
                }}
                className="px-4 py-2 rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {idToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center mb-4 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-center text-slate-900 dark:text-white mb-2">Delete Note?</h3>
            <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-6">
              Are you sure you want to delete this note? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setIdToDelete(null)}
                className="flex-1 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeleteNote(idToDelete);
                  setIdToDelete(null);
                }}
                className="flex-1 py-2.5 bg-red-600 rounded-xl text-sm font-semibold text-white hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
