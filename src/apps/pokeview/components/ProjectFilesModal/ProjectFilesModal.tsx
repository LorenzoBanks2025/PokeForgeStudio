/**
 * @file ProjectFilesModal.tsx
 * @package pokeview
 * @description Inspector for viewing the actual files inside projects/<projectName>/ directory on disk.
 */

import React, { useState, useEffect } from 'react';
import { ProjectManager, ProjectFileInfo } from '@/src/services/projectManager.ts';
import { X, Folder, FileText, Disc, Database, Download, RefreshCw, Code, Check } from 'lucide-react';

interface ProjectFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
}

export const ProjectFilesModal: React.FC<ProjectFilesModalProps> = ({
  isOpen,
  onClose,
  projectName
}) => {
  const [files, setFiles] = useState<ProjectFileInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFile, setSelectedFile] = useState<string>('manifest.json');
  const [fileContent, setFileContent] = useState<string>('');
  const [isContentLoading, setIsContentLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const list = await ProjectManager.fetchFilesList(projectName);
      setFiles(list);
      if (list.length > 0 && !selectedFile) {
        setSelectedFile(list[0].relativePath);
      }
    } catch {
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadFiles();
    }
  }, [isOpen, projectName]);

  useEffect(() => {
    if (!isOpen || !selectedFile) return;

    if (selectedFile.endsWith('.gba')) {
      setFileContent('// Binary GBA ROM image (16,777,216 bytes). Binary view not rendered.');
      return;
    }

    setIsContentLoading(true);
    fetch(`/api/project/${encodeURIComponent(projectName)}/file-content?path=${encodeURIComponent(selectedFile)}`)
      .then(res => res.json())
      .then(data => {
        if (data.content) {
          setFileContent(data.content);
        } else if (data.binary) {
          setFileContent(`// Binary file: ${data.size} bytes`);
        } else {
          setFileContent('// File content unavailable');
        }
      })
      .catch(err => {
        setFileContent(`// Error loading file: ${err.message}`);
      })
      .finally(() => {
        setIsContentLoading(false);
      });
  }, [isOpen, selectedFile, projectName]);

  const handleCopyContent = () => {
    navigator.clipboard.writeText(fileContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl h-[80vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
                <span>Project Directory Inspector</span>
                <span className="text-xs font-mono font-normal text-indigo-400 bg-slate-800 px-2 py-0.5 rounded">
                  projects/{projectName}/
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Explore manifest, modular data files, assets, and base ROM binary on disk.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadFiles}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Refresh Directory"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* File Tree Left Pane */}
          <div className="w-72 bg-slate-950/70 border-r border-slate-800 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-slate-800/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Files & Folders ({files.length})</span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {loading ? (
                <div className="py-8 text-center text-xs text-slate-500">Loading files...</div>
              ) : files.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">No files found.</div>
              ) : (
                files.map(f => {
                  if (f.isDirectory) return null;
                  const isSelected = f.relativePath === selectedFile;
                  const isBaseRom = f.name === 'base_rom.gba' || f.name === 'compiled_rom.gba';
                  const isManifest = f.name === 'manifest.json';

                  return (
                    <button
                      key={f.relativePath}
                      onClick={() => setSelectedFile(f.relativePath)}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white font-medium'
                          : 'text-slate-300 hover:bg-slate-850 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {isBaseRom ? (
                          <Disc className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-emerald-400'}`} />
                        ) : isManifest ? (
                          <Database className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-amber-400'}`} />
                        ) : (
                          <FileText className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                        )}
                        <span className="truncate">{f.relativePath}</span>
                      </div>
                      <span className={`text-[10px] font-mono shrink-0 ml-1 ${isSelected ? 'text-indigo-200' : 'text-slate-500'}`}>
                        {f.size > 1024 * 1024
                          ? `${(f.size / (1024 * 1024)).toFixed(1)} MB`
                          : `${Math.round(f.size / 1024)} KB`}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Base ROM Download Action */}
            <div className="p-3 border-t border-slate-800 bg-slate-900/40">
              <a
                href={`/api/project/${encodeURIComponent(projectName)}/base-rom`}
                download={`${projectName}_base_rom.gba`}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-lg text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Download Base ROM</span>
              </a>
            </div>
          </div>

          {/* Right File Viewer Pane */}
          <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
            {/* File Viewer Header */}
            <div className="px-4 py-2.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-2 text-xs">
                <Code className="w-4 h-4 text-indigo-400" />
                <span className="font-mono text-slate-200">{selectedFile}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyContent}
                  disabled={!fileContent || selectedFile.endsWith('.gba')}
                  className="px-2 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-30"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Code / Content Area */}
            <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-300 leading-relaxed bg-slate-950">
              {isContentLoading ? (
                <div className="py-12 text-center text-slate-500">Loading file content...</div>
              ) : selectedFile.endsWith('.gba') ? (
                <div className="py-16 text-center space-y-3">
                  <Disc className="w-12 h-12 text-emerald-400 mx-auto animate-pulse" />
                  <div className="text-sm font-semibold text-white">GBA Binary ROM File</div>
                  <div className="text-xs text-slate-400 max-w-sm mx-auto">
                    This is the 16MB Nintendo Game Boy Advance binary ROM image stored in <code className="text-indigo-400 font-mono">projects/{projectName}/base_rom.gba</code>.
                  </div>
                  <a
                    href={`/api/project/${encodeURIComponent(projectName)}/base-rom`}
                    download={`${projectName}_base_rom.gba`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Binary ROM (.gba)</span>
                  </a>
                </div>
              ) : (
                <pre className="whitespace-pre-wrap">{fileContent}</pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
