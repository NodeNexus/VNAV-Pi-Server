import React, { useState, useEffect } from 'react';
import {
  FolderOpen,
  Folder,
  File,
  FileText,
  FileCode,
  Image,
  ChevronRight,
  ArrowLeft,
  Eye,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { listFiles, previewFile, formatBytes } from '../services/api';

interface FileItem {
  name: string;
  rel_path: string;
  is_dir: boolean;
  size_bytes: number;
  modified: string;
  extension: string;
}

export const FileManagerPage: React.FC = () => {
  const [currentPath, setCurrentPath] = useState('');
  const [items, setItems] = useState<FileItem[]>([]);
  const [rootName, setRootName] = useState('vnavhomelab');
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadDirectory = async (path: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await listFiles(path);
      setItems(data.items || []);
      setRootName(data.root_name || 'workspace');
      setCurrentPath(data.current_path || '');
      setPreviewData(null);
    } catch (e: any) {
      setErrorMsg(e?.message || 'Access restricted');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDirectory('');
  }, []);

  const handleOpenFolder = (relPath: string) => {
    loadDirectory(relPath);
  };

  const handleGoUp = () => {
    if (!currentPath) return;
    const parts = currentPath.split('/');
    parts.pop();
    loadDirectory(parts.join('/'));
  };

  const handlePreview = async (relPath: string) => {
    try {
      const data = await previewFile(relPath);
      setPreviewData(data);
    } catch (e: any) {
      alert('Could not preview file: ' + e?.message);
    }
  };

  const getFileIcon = (isDir: boolean, ext: string) => {
    if (isDir) return <Folder className="w-4 h-4 text-cyan-400" />;
    if (['.ts', '.tsx', '.js', '.jsx', '.py', '.json', '.html', '.css'].includes(ext)) {
      return <FileCode className="w-4 h-4 text-purple-400" />;
    }
    if (['.png', '.jpg', '.jpeg', '.webp', '.svg'].includes(ext)) {
      return <Image className="w-4 h-4 text-emerald-400" />;
    }
    return <FileText className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="rounded-2xl p-6 bg-brand-card/90 border border-brand-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Secured Homelab File Browser</h2>
            <p className="text-xs text-slate-400">
              Restricted strictly to authorized project &amp; server configuration directory boundaries
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
          <Lock className="w-3 h-3 text-cyan-400" />
          <span>Boundary Guard Active</span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
          {errorMsg}
        </div>
      )}

      {/* Breadcrumb Navigation Bar */}
      <div className="rounded-xl p-3 bg-slate-900/80 border border-brand-border flex items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => loadDirectory('')}
            className="text-cyan-400 hover:text-cyan-200 font-bold"
          >
            {rootName}
          </button>
          {currentPath && (
            <>
              {currentPath.split('/').map((seg, idx, arr) => (
                <React.Fragment key={idx}>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  <button
                    onClick={() => loadDirectory(arr.slice(0, idx + 1).join('/'))}
                    className="text-slate-300 hover:text-cyan-300 truncate"
                  >
                    {seg}
                  </button>
                </React.Fragment>
              ))}
            </>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {currentPath && (
            <button
              onClick={handleGoUp}
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              title="Parent directory"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => loadDirectory(currentPath)}
            className="p-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-800"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Directory items table */}
      <div className="rounded-2xl border border-brand-border bg-brand-card/90 overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-brand-darkest/80 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-brand-border">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Last Modified</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500">
                    Directory is empty.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.rel_path} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <button
                        onClick={() =>
                          item.is_dir ? handleOpenFolder(item.rel_path) : handlePreview(item.rel_path)
                        }
                        className="flex items-center gap-2.5 text-slate-200 hover:text-cyan-300 font-semibold text-left transition-colors"
                      >
                        {getFileIcon(item.is_dir, item.extension)}
                        <span>{item.name}</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {item.is_dir ? '—' : formatBytes(item.size_bytes)}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">{item.modified}</td>
                    <td className="py-3 px-4 text-right">
                      {!item.is_dir && (
                        <button
                          onClick={() => handlePreview(item.rel_path)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-sans font-semibold inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Preview</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* File Preview Modal / Section */}
      {previewData && (
        <div className="rounded-2xl p-5 bg-brand-darkest border border-cyan-500/40 shadow-2xl space-y-3 font-mono">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-slate-100">{previewData.name}</span>
              <span className="text-[11px] text-slate-500">
                ({formatBytes(previewData.size_bytes)})
              </span>
            </div>
            <button
              onClick={() => setPreviewData(null)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              ✕ Close
            </button>
          </div>
          {previewData.is_binary ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              Binary file preview not supported in text viewer.
            </div>
          ) : (
            <pre className="p-4 rounded-xl bg-slate-950 text-xs text-slate-200 overflow-x-auto max-h-96 leading-relaxed select-text border border-slate-900">
              {previewData.content}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};
