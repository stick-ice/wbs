import { useRef, useState } from 'react';
import type { Task } from '../types';
import { encryptJSON, decryptJSON } from '../utils/crypto';

interface Props {
  tasks: Task[];
  onImport: (tasks: Task[]) => void;
}

type Mode = 'export' | 'import';

interface ModalState {
  mode: Mode;
  file?: File;
}

export default function DataControls({ tasks, onImport }: Props) {
  const [modal, setModal] = useState<ModalState | null>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setModal(null);
    setPassword('');
    setConfirm('');
    setError('');
    setLoading(false);
  };

  const handleExport = async () => {
    if (!password) { setError('パスワードを入力してください'); return; }
    if (password !== confirm) { setError('パスワードが一致しません'); return; }
    setLoading(true);
    try {
      const encrypted = await encryptJSON(tasks, password);
      const blob = new Blob([encrypted], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wbs_${new Date().toISOString().slice(0, 10)}.wbs`;
      a.click();
      URL.revokeObjectURL(url);
      reset();
    } catch {
      setError('暗号化に失敗しました');
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!password) { setError('パスワードを入力してください'); return; }
    if (!modal?.file) return;
    setLoading(true);
    try {
      const text = await modal.file.text();
      const imported = await decryptJSON<Task[]>(text, password);
      if (!Array.isArray(imported)) throw new Error();
      if (tasks.length > 0 && !confirm_overwrite()) { reset(); return; }
      onImport(imported);
      reset();
    } catch {
      setError('復号に失敗しました。パスワードまたはファイルが正しくありません');
      setLoading(false);
    }
  };

  const confirm_overwrite = () =>
    window.confirm('既存のデータはすべて上書きされます。続行しますか？');

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setModal({ mode: 'import', file });
    e.target.value = '';
  };

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={() => setModal({ mode: 'export' })}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
        >
          エクスポート
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
        >
          インポート
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".wbs"
          className="hidden"
          onChange={onFileChange}
        />
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h2 className="text-base font-semibold text-gray-800 mb-4">
              {modal.mode === 'export' ? 'データをエクスポート' : 'データをインポート'}
            </h2>

            {modal.mode === 'import' && modal.file && (
              <p className="text-xs text-gray-500 mb-3 break-all">
                ファイル: {modal.file.name}
              </p>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {modal.mode === 'export' ? '暗号化パスワード' : '復号パスワード'}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="パスワードを入力"
                  autoFocus
                />
              </div>

              {modal.mode === 'export' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    パスワード（確認）
                  </label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => { setConfirm(e.target.value); setError(''); }}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="もう一度入力"
                  />
                </div>
              )}

              {error && <p className="text-xs text-red-500">{error}</p>}

              <p className="text-xs text-gray-400">
                {modal.mode === 'export'
                  ? 'パスワードを忘れると復元できません。安全な場所に保管してください。'
                  : 'エクスポート時に設定したパスワードを入力してください。'}
              </p>
            </div>

            <div className="flex gap-2 mt-5 justify-end">
              <button
                onClick={reset}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
              >
                キャンセル
              </button>
              <button
                onClick={modal.mode === 'export' ? handleExport : handleImport}
                disabled={loading}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? '処理中...' : modal.mode === 'export' ? 'ダウンロード' : '読み込む'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
