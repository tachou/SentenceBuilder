import { useState, useRef } from 'react';
import type { Language } from '../types';
import { useGameStore } from '../store/gameStore';
import { t } from '../data/i18n';
import { uploadWordList, fetchWordLists, fetchWordListWords, deleteWordList, toggleWordListActive, customWordsToEntries } from '../lib/api';
import type { CustomWordListInfo, UploadPreviewResponse } from '../lib/api';

interface WordListUploadProps {
  onClose: () => void;
  preselectedLanguage?: Language;
}

const POS_LABELS: Record<string, string> = {
  noun: 'N', verb: 'V', adjective: 'Adj', adverb: 'Adv',
  phrase: 'Phr', conjunction: 'Con', particle: 'Ptc', other: '...',
};

export function WordListUpload({ onClose, preselectedLanguage }: WordListUploadProps) {
  const uiLanguage = useGameStore((s) => s.uiLanguage);
  const setActiveCustomList = useGameStore((s) => s.setActiveCustomList);
  const locale = t(uiLanguage);

  const [lists, setLists] = useState<CustomWordListInfo[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [language, setLanguage] = useState<Language>(preselectedLanguage || 'en');
  const [preview, setPreview] = useState<UploadPreviewResponse | null>(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadLists = async () => {
    try {
      const data = await fetchWordLists();
      setLists(data);
      setLoaded(true);
    } catch { setLoaded(true); }
  };

  if (!loaded) loadLists();

  const handleFileSelect = async () => {
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const result = await uploadWordList(file, name || 'Custom List', language, false);
      if ('preview' in result) {
        setPreview(result as UploadPreviewResponse);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    }
    setUploading(false);
  };

  const handleConfirm = async () => {
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      await uploadWordList(file, name || 'Custom List', language, true);
      setFile(null);
      setPreview(null);
      setName('');
      if (fileRef.current) fileRef.current.value = '';
      await loadLists();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    }
    setUploading(false);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteWordList(id);
      await loadLists();
    } catch { /* ignore */ }
  };

  const handleToggleActive = async (list: CustomWordListInfo) => {
    try {
      const result = await toggleWordListActive(list.id);
      if (result.isActive) {
        const data = await fetchWordListWords(list.id);
        const entries = customWordsToEntries(data.words, list.language, list.id);
        setActiveCustomList(list.id, entries);
      } else {
        setActiveCustomList(null);
      }
      await loadLists();
    } catch { /* ignore */ }
  };

  const langOptions: { code: Language; label: string }[] = [
    { code: 'en', label: 'EN' },
    { code: 'fr', label: 'FR' },
    { code: 'zh-Hans', label: '\u4e2d\u6587' },
  ];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        role="dialog" aria-modal="true" aria-label={locale.settings}>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-purple-700">{locale.uploadWordList || 'Word Lists'}</h2>
          <button onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl min-w-[44px] min-h-[44px] flex items-center justify-center">
            {'\u2715'}
          </button>
        </div>

        {/* Existing lists */}
        {lists.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">{locale.customWords || 'Your Lists'}</h3>
            <div className="space-y-2">
              {lists.map((list) => (
                <div key={list.id} className="flex items-center gap-2 bg-gray-50 rounded-xl p-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-700 truncate">{list.name}</p>
                    <p className="text-xs text-gray-500">{list.language.toUpperCase()} &middot; {list.word_count} words</p>
                  </div>
                  <button onClick={() => handleToggleActive(list)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold min-h-[36px] transition-all ${
                      list.is_active ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                    }`}>
                    {list.is_active ? '\u2713 Active' : 'Use'}
                  </button>
                  <button onClick={() => handleDelete(list.id)}
                    className="text-gray-400 hover:text-red-500 min-w-[36px] min-h-[36px] flex items-center justify-center text-lg">
                    {'\ud83d\uddd1\ufe0f'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload new list */}
        <div className="border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-600 mb-3">{locale.uploadFile || 'Upload New List'}</h3>

          <input ref={fileRef} type="file" accept=".csv,.json"
            onChange={(e) => { setFile(e.target.files?.[0] || null); setPreview(null); setError(''); }}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 mb-3" />

          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder={locale.listName || 'List name'}
            className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 text-sm focus:border-purple-400 focus:outline-none mb-3" />

          <div className="flex gap-1 bg-gray-100 rounded-full p-1 mb-3">
            {langOptions.map((opt) => (
              <button key={opt.code} onClick={() => setLanguage(opt.code)}
                className={`flex-1 px-3 py-1.5 rounded-full text-xs font-bold min-h-[36px] transition-all ${
                  language === opt.code ? 'bg-purple-500 text-white shadow-sm' : 'text-gray-500 hover:bg-white/80'
                }`}>
                {opt.label}
              </button>
            ))}
          </div>

          {file && !preview && (
            <button onClick={handleFileSelect} disabled={uploading}
              className="w-full py-2.5 rounded-full bg-purple-500 text-white font-bold text-sm hover:bg-purple-600 transition-colors disabled:opacity-50 mb-3">
              {uploading ? '...' : (locale.preview || 'Preview')}
            </button>
          )}

          {error && <p className="text-red-500 text-sm font-semibold mb-3">{error}</p>}

          {/* Preview table */}
          {preview && (
            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-2">
                {preview.totalCount} words found
                {preview.warnings.length > 0 && ` (${preview.warnings.length} warnings)`}
                {preview.duplicates.length > 0 && ` (${preview.duplicates.length} duplicates removed)`}
              </p>
              <div className="bg-gray-50 rounded-xl p-2 max-h-40 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-500">
                      <th className="text-left pb-1">Word</th>
                      <th className="text-left pb-1">Type</th>
                      <th className="text-left pb-1">Phonetic</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.entries.map((e, i) => (
                      <tr key={i} className="border-t border-gray-200">
                        <td className="py-1 font-semibold">{e.word}</td>
                        <td className="py-1 text-gray-500">{POS_LABELS[e.pos] || e.pos}</td>
                        <td className="py-1 text-gray-400">{e.phonetic || ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.totalCount > 10 && (
                  <p className="text-xs text-gray-400 mt-1">...and {preview.totalCount - 10} more</p>
                )}
              </div>

              <button onClick={handleConfirm} disabled={uploading}
                className="w-full mt-3 py-2.5 rounded-full bg-green-500 text-white font-bold text-sm hover:bg-green-600 transition-colors disabled:opacity-50">
                {uploading ? '...' : (locale.confirmUpload || 'Confirm Upload')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
