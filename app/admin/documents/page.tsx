'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Document } from '@/types';
import { FileText, Upload, Trash2, CheckCircle, XCircle, Clock, Sparkles } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Loading from '@/components/Loading';
import { motion, AnimatePresence } from 'framer-motion';

export default function DocumentsPage() {
  const { user } = useUser();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/documents');
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Only PDF files are supported');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        await fetchDocuments();
      } else {
        const data = await res.json();
        const errorMsg = data.error || 'Upload failed';
        const hint = data.hint ? `\n\n${data.hint}` : '';
        alert(`${errorMsg}${hint}`);
      }
    } catch (error: any) {
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const res = await fetch(`/api/admin/documents/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchDocuments();
      } else {
        const data = await res.json();
        alert(`Delete failed: ${data.error}`);
      }
    } catch (error: any) {
      alert(`Delete failed: ${error.message}`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Loading size="sm" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'failed':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f]">
      <Sidebar />
      
      <div className="flex-1 ml-64 flex flex-col relative">
        {/* Grid Background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40"></div>

        {/* Header */}
        <div className="relative z-10 glass-dark border-b border-purple-500/20 px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold gradient-text">Document Management</h1>
            <label className="px-5 py-2.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 text-white rounded-lg font-medium cursor-pointer hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center gap-2 glow-purple">
              <Upload className="w-4 h-4" />
              {uploading ? 'Uploading...' : 'Upload PDF'}
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto px-8 py-8 relative z-10">
          {/* Drag and Drop Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`glass-card border-2 border-dashed rounded-2xl p-12 text-center mb-8 transition-all ${
              dragActive
                ? 'border-purple-400 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                : 'border-purple-500/30 hover:border-purple-400/50'
            }`}
          >
            <Upload className="w-12 h-12 text-purple-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Drag & Drop PDF Files</h3>
            <p className="text-purple-200/70 text-sm">or click the upload button above</p>
          </motion.div>

          {/* Documents List */}
          {loading ? (
            <div className="text-center py-20">
              <Loading size="md" text="Loading documents..." />
            </div>
          ) : documents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 glass-card border border-purple-500/30 rounded-2xl"
            >
              <FileText className="w-16 h-16 text-purple-300/50 mx-auto mb-4" />
              <p className="text-purple-200/70 mb-2">No documents uploaded yet</p>
              <p className="text-purple-300/50 text-sm">Upload a PDF to get started with RAG</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {documents.map((doc, idx) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                    className="glass-card border border-purple-500/20 rounded-xl p-5 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all group hover-lift"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-lg flex items-center justify-center border border-purple-500/30">
                        <FileText className="w-6 h-6 text-purple-300" />
                      </div>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity border border-transparent hover:border-red-500/30"
                      >
                        <Trash2 className="w-4 h-4 text-purple-300 hover:text-red-400" />
                      </button>
                    </div>

                    <h3 className="text-white font-medium mb-3 truncate">{doc.filename}</h3>

                    <div className="flex items-center justify-between mb-3">
                      <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs ${getStatusColor(doc.status)}`}>
                        {getStatusIcon(doc.status)}
                        <span className="capitalize">{doc.status}</span>
                      </div>
                      <span className="text-xs text-purple-300/60">
                        {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : 'N/A'}
                      </span>
                    </div>

                    <div className="text-xs text-purple-300/50">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
