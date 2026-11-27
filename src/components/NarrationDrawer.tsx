import {
  Check,
  Download,
  FileAudio,
  Pause,
  Play,
  RotateCcw,
  Trash2,
  Upload,
  Volume2,
  X,
} from 'lucide-react';
import { ChangeEvent, useRef, useState } from 'react';
import { NarrationSegment, UploadedVoiceoverRecord } from '../types/optics';

interface NarrationDrawerProps {
  open: boolean;
  onClose: () => void;
  segments: NarrationSegment[];
  activeSegmentId: string;
  onSelectSegment: (segment: NarrationSegment, syncScene: boolean) => void;
  customScripts: Record<string, string>;
  onUpdateScript: (segmentId: string, nextText: string) => void;
  onResetScript: (segmentId: string) => void;
  voiceovers: Record<string, UploadedVoiceoverRecord>;
  onUploadVoiceover: (segmentId: string, file: File) => Promise<void>;
  onDeleteVoiceover: (segmentId: string) => Promise<void>;
  isPlaying: boolean;
  isTtsSpeaking: boolean;
  audioCurrentTime: number;
  audioDuration: number;
  autoAdvance: boolean;
  onToggleAutoAdvance: () => void;
  onPlaySegment: (segment: NarrationSegment) => void;
  onStopPlayback: () => void;
  onSeekAudio: (sec: number) => void;
  onSpeakTts: (segment: NarrationSegment) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatClock(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '00:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function NarrationDrawer({
  open,
  onClose,
  segments,
  activeSegmentId,
  onSelectSegment,
  customScripts,
  onUpdateScript,
  onResetScript,
  voiceovers,
  onUploadVoiceover,
  onDeleteVoiceover,
  isPlaying,
  isTtsSpeaking,
  audioCurrentTime,
  audioDuration,
  autoAdvance,
  onToggleAutoAdvance,
  onPlaySegment,
  onStopPlayback,
  onSeekAudio,
  onSpeakTts,
}: NarrationDrawerProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [editingScript, setEditingScript] = useState(false);

  if (!open) return null;

  const activeSegment =
    segments.find((s) => s.id === activeSegmentId) ?? segments[0];
  const activeScript =
    customScripts[activeSegment.id] ?? activeSegment.defaultScript;
  const activeVoiceover = voiceovers[activeSegment.id];
  const activeHasAudio = Boolean(
    activeVoiceover || activeSegment.defaultAudioUrl
  );

  const mirrorSegments = segments.filter((s) => s.module === 'mirror');
  const eyeSegments = segments.filter((s) => s.module === 'eye');

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      setUploadError(
        'Format file tidak didukung. Pilih file audio (MP3, WAV, M4A, OGG, atau WebM).'
      );
      return;
    }

    setUploadError(null);
    setUploading(true);
    try {
      await onUploadVoiceover(activeSegment.id, file);
    } catch {
      setUploadError('Gagal menyimpan file audio ke penyimpanan lokal browser.');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadFullScript = () => {
    const lines: string[] = [
      'NASKAH NARASI VOICEOVER IPAS SD KELAS 5 — OPTIKALAB 3D',
      '======================================================',
      '',
    ];
    for (const seg of segments) {
      const text = customScripts[seg.id] ?? seg.defaultScript;
      lines.push(`[${seg.sectionLabel}] ${seg.title} (${seg.durationHint})`);
      lines.push(`Poin Belajar: ${seg.keyConcepts.join(' · ')}`);
      lines.push('');
      lines.push(text);
      lines.push('');
      lines.push('------------------------------------------------------');
      lines.push('');
    }
    const blob = new Blob([lines.join('\n')], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Naskah-Voiceover-IPAS-Kelas-5.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6 bg-slate-900/55"
      role="dialog"
      aria-modal="true"
      aria-label="Studio Naskah dan Upload Voiceover SD Kelas 5"
    >
      <div className="w-full max-w-5xl max-h-[88vh] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden text-slate-900">
        {/* Drawer Header */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Naskah Cerita &amp; Upload Voiceover (IPAS SD Kelas 5)
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Unggah rekaman suara Anda di setiap bab agar simulasi 3D otomatis bergerak mengikuti penjelasan.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDownloadFullScript}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-200 text-slate-800 hover:bg-slate-300 transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Unduh Semua Naskah (.txt)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup panel narasi"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Two-Column Structured Layout */}
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12">
          {/* Left Column: Structured Chapter Playlist */}
          <aside className="md:col-span-5 border-b md:border-b-0 md:border-r border-slate-200 overflow-y-auto lab-scroll p-4 space-y-5 bg-slate-50/50">
            <div>
              <h3 className="text-xs font-bold text-slate-500 px-2 mb-2">
                Bagian 1 · Cermin Cekung &amp; Cembung
              </h3>
              <div className="space-y-1">
                {mirrorSegments.map((seg) => {
                  const selected = seg.id === activeSegment.id;
                  const hasAudio = Boolean(
                    voiceovers[seg.id] || seg.defaultAudioUrl
                  );
                  return (
                    <button
                      key={seg.id}
                      type="button"
                      onClick={() => {
                        setEditingScript(false);
                        setUploadError(null);
                        onSelectSegment(seg, true);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors ${
                        selected
                          ? 'bg-sky-50 text-sky-950 border border-sky-300'
                          : 'text-slate-700 hover:bg-slate-100 border border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold leading-snug">
                          {seg.title}
                        </span>
                        {hasAudio && (
                          <Check
                            className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5"
                            aria-label="Voiceover siap"
                          />
                        )}
                      </div>
                      <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-2">
                        <span>{seg.durationHint}</span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {voiceovers[seg.id]
                            ? 'Audio kustom'
                            : seg.defaultAudioUrl
                            ? 'Voiceover siap'
                            : 'Belum ada rekaman'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-500 px-2 mb-2">
                Bagian 2 · Cara Kerja Mata &amp; Kacamata
              </h3>
              <div className="space-y-1">
                {eyeSegments.map((seg) => {
                  const selected = seg.id === activeSegment.id;
                  const hasAudio = Boolean(
                    voiceovers[seg.id] || seg.defaultAudioUrl
                  );
                  return (
                    <button
                      key={seg.id}
                      type="button"
                      onClick={() => {
                        setEditingScript(false);
                        setUploadError(null);
                        onSelectSegment(seg, true);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors ${
                        selected
                          ? 'bg-sky-50 text-sky-950 border border-sky-300'
                          : 'text-slate-700 hover:bg-slate-100 border border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold leading-snug">
                          {seg.title}
                        </span>
                        {hasAudio && (
                          <Check
                            className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5"
                            aria-label="Voiceover terunggah"
                          />
                        )}
                      </div>
                      <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-2">
                        <span>{seg.durationHint}</span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {voiceovers[seg.id]
                            ? 'Audio kustom'
                            : seg.defaultAudioUrl
                            ? 'Voiceover siap'
                            : 'Belum ada rekaman'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Right Column: Script Reader + Voiceover Upload */}
          <div className="md:col-span-7 overflow-y-auto lab-scroll p-6 flex flex-col gap-5 bg-white">
            <div>
              <div className="text-xs text-sky-700 font-semibold">
                {activeSegment.sectionLabel} · {activeSegment.durationHint}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                {activeSegment.title}
              </h3>
              <div className="mt-1.5 text-xs text-slate-600">
                Poin penting: {activeSegment.keyConcepts.join(' · ')}
              </div>
            </div>

            {/* Structured Audio Upload & Playback Bar */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileAudio
                    className={`w-4 h-4 shrink-0 ${
                      activeHasAudio ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900 truncate">
                      {activeVoiceover
                        ? activeVoiceover.fileName
                        : activeSegment.defaultAudioLabel ??
                          'Belum ada file voiceover untuk bab ini'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {activeVoiceover
                        ? `Audio kustom tersimpan (${formatBytes(activeVoiceover.sizeBytes)})`
                        : activeSegment.defaultAudioUrl
                        ? 'Rekaman voiceover terpasang permanen di aplikasi · Bisa diganti kapan saja'
                        : 'Mendukung MP3, WAV, M4A, OGG, WebM — tersimpan otomatis di browser'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors whitespace-nowrap disabled:opacity-60"
                  >
                    <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>
                      {uploading
                        ? 'Menyimpan...'
                        : activeHasAudio
                        ? 'Ganti Audio'
                        : 'Upload Voiceover'}
                    </span>
                  </button>

                  {activeVoiceover && (
                    <button
                      type="button"
                      onClick={() => onDeleteVoiceover(activeSegment.id)}
                      aria-label="Hapus audio kustom dan kembalikan rekaman bawaan"
                      className="p-2 rounded-lg bg-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {uploadError && (
                <p className="text-xs font-medium text-red-600">{uploadError}</p>
              )}

              <div className="pt-2.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {activeHasAudio ? (
                    <button
                      type="button"
                      onClick={() =>
                        isPlaying
                          ? onStopPlayback()
                          : onPlaySegment(activeSegment)
                      }
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors whitespace-nowrap"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          <span>Jeda Voiceover</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          <span>Putar &amp; Sinkron 3D</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        isTtsSpeaking
                          ? onStopPlayback()
                          : onSpeakTts(activeSegment)
                      }
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors whitespace-nowrap"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>
                        {isTtsSpeaking
                          ? 'Hentikan Suara'
                          : 'Dengarkan Suara Sistem (TTS)'}
                      </span>
                    </button>
                  )}

                  <label className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer ml-2">
                    <input
                      type="checkbox"
                      checked={autoAdvance}
                      onChange={onToggleAutoAdvance}
                      className="rounded border-slate-300 accent-sky-600"
                    />
                    <span>Lanjut otomatis</span>
                  </label>
                </div>

                {activeHasAudio && (
                  <div className="flex items-center gap-2.5 flex-1 min-w-[180px]">
                    <input
                      type="range"
                      min={0}
                      max={Math.max(1, audioDuration)}
                      step={0.1}
                      value={Math.min(
                        audioCurrentTime,
                        Math.max(1, audioDuration)
                      )}
                      onChange={(e) => onSeekAudio(parseFloat(e.target.value))}
                      aria-label="Posisi putar audio"
                      className="optical-slider"
                    />
                    <span className="text-[11px] font-mono-tabular text-slate-600 shrink-0">
                      {formatClock(audioCurrentTime)} /{' '}
                      {formatClock(audioDuration)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Narration Script Text Area */}
            <div className="flex-1 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  Naskah Narasi Siap Rekam (Bahasa Anak SD Kelas 5)
                </span>
                <div className="flex items-center gap-2.5">
                  {customScripts[activeSegment.id] && (
                    <button
                      type="button"
                      onClick={() => onResetScript(activeSegment.id)}
                      className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" aria-hidden="true" />
                      <span>Naskah Asli</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setEditingScript((v) => !v)}
                    className="text-xs font-semibold text-sky-700 hover:text-sky-900 transition-colors"
                  >
                    {editingScript ? 'Selesai Ubah' : 'Ubah Naskah'}
                  </button>
                </div>
              </div>

              {editingScript ? (
                <textarea
                  value={activeScript}
                  onChange={(e) =>
                    onUpdateScript(activeSegment.id, e.target.value)
                  }
                  rows={7}
                  className="w-full p-4 rounded-xl bg-white border border-sky-400 text-sm leading-relaxed text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-[15px] leading-relaxed text-slate-800 select-text">
                  {activeScript}
                </div>
              )}

              <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
                <span>
                  Saat bab dipilih atau diputar, simulasi 3D otomatis menyesuaikan contohnya.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onSelectSegment(activeSegment, true);
                    onClose();
                  }}
                  className="text-sky-700 hover:text-sky-900 font-semibold whitespace-nowrap ml-4"
                >
                  Lihat di Simulasi 3D →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
