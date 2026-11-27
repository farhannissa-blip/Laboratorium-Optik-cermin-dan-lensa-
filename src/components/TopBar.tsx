import { Headphones, Maximize2, Minimize2, Play, Square } from 'lucide-react';
import {
  EyeLabState,
  EyeOpticsResult,
  LabModule,
  MirrorLabState,
  MirrorOpticsResult,
} from '../types/optics';

interface TopBarProps {
  activeModule: LabModule;
  onSelectModule: (module: LabModule) => void;
  onOpenNarration: () => void;
  uploadedCount: number;
  totalSegments: number;
  mirrorState: MirrorLabState;
  mirrorResult: MirrorOpticsResult;
  eyeState: EyeLabState;
  eyeResult: EyeOpticsResult;
  guidedTopic: LabModule | null;
  isGuidedPlaying: boolean;
  onToggleGuidedTopic: (topic: LabModule) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export function TopBar({
  activeModule,
  onSelectModule,
  onOpenNarration,
  uploadedCount,
  totalSegments,
  mirrorState,
  mirrorResult,
  eyeState,
  eyeResult,
  guidedTopic,
  isGuidedPlaying,
  onToggleGuidedTopic,
  isFullscreen,
  onToggleFullscreen,
}: TopBarProps) {
  const conditionTitle =
    eyeState.condition === 'myopia'
      ? 'Rabun Jauh (Miopia)'
      : eyeState.condition === 'hyperopia'
      ? 'Rabun Dekat (Hipermetropia)'
      : 'Mata Sehat (Normal)';

  const simpleMirrorSummary = mirrorResult.isAtInfinity
    ? 'Benda tepat di Titik Fokus — sinar pantul sejajar!'
    : `${mirrorResult.isUpright ? 'Tegak' : 'Terbalik'}, ${
        mirrorResult.sizeCategory === 'Diperbesar'
          ? 'Lebih Besar'
          : mirrorResult.sizeCategory === 'Diperkecil'
          ? 'Lebih Kecil'
          : 'Sama Besar'
      }, ${
        mirrorResult.isReal
          ? 'Nyata (bisa ditangkap layar)'
          : 'Maya (terlihat di dalam cermin)'
      }`;

  const simpleEyeFocus = eyeResult.isSharp
    ? 'Cahaya tepat di Layar Retina — Pandangan Tajam!'
    : eyeResult.focusErrorUnits < 0
    ? 'Cahaya bertemu di DEPAN Retina — Pandangan Buram!'
    : 'Cahaya bertemu di BELAKANG Retina — Pandangan Buram!';

  // Dynamic visual blur in pixels for the live "Cara Mata Melihat" preview
  const previewBlurPx = eyeResult.isSharp
    ? 0
    : Math.min(7, Number((eyeResult.blurRadius * 6.5).toFixed(1)));

  return (
    <div className="fixed top-0 inset-x-0 z-20 pointer-events-none">
      {/* Strict 3-Zone Top Bar Contract — Bright Classroom Theme */}
      <header className="pointer-events-auto flex items-center justify-between gap-4 md:gap-8 px-4 md:px-6 h-14 bg-white/[0.96] border-b border-slate-200 overflow-x-auto">
        {/* Zone 1: Single text element wordmark */}
        <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
          OptikaLab 3D
        </span>

        {/* Zone 2: Clean single-line module navigation links */}
        <nav
          aria-label="Materi IPAS Kelas 5"
          className="flex items-center gap-4 md:gap-6 text-xs sm:text-sm font-semibold"
        >
          <button
            type="button"
            onClick={() => onSelectModule('mirror')}
            className={`py-1.5 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeModule === 'mirror'
                ? 'text-sky-700 border-sky-600'
                : 'text-slate-500 border-transparent hover:text-slate-900'
            }`}
          >
            Cermin Cekung &amp; Cembung
          </button>
          <button
            type="button"
            onClick={() => onSelectModule('eye')}
            className={`py-1.5 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeModule === 'eye'
                ? 'text-sky-700 border-sky-600'
                : 'text-slate-500 border-transparent hover:text-slate-900'
            }`}
          >
            Mata &amp; Kacamata (Miopia / Hipermetropia)
          </button>
        </nav>

        {/* Zone 3: Voiceover studio & Full Screen toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenNarration}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-xs font-semibold rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-sky-600"
          >
            <Headphones className="w-3.5 h-3.5" aria-hidden="true" />
            <span>
              Naskah &amp; Voiceover ({uploadedCount}/{totalSegments})
            </span>
          </button>

          <button
            type="button"
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Keluar dari Full Screen (F)' : 'Tampilkan Full Screen (F)'}
            aria-label={isFullscreen ? 'Keluar dari Full Screen' : 'Tampilkan Full Screen'}
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-sky-600 ${
              isFullscreen
                ? 'bg-slate-900 border-slate-900 text-white hover:bg-slate-800'
                : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
            }`}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Keluar Full Screen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Full Screen</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Easy-to-read Grade 5 Summary Strip + One-Click Guided Animation Buttons */}
      <div className="px-3 md:px-6 pt-2.5 flex items-start justify-between gap-3">
        <div className="flex flex-col items-start gap-2 min-w-0">
          {/* Guided 3D Animated Explanation Launchers (Mirror & Eye Topics) */}
          <div className="pointer-events-auto flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleGuidedTopic('mirror')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border shadow-sm transition-colors whitespace-nowrap ${
                isGuidedPlaying && guidedTopic === 'mirror'
                  ? 'bg-rose-600 border-rose-600 text-white hover:bg-rose-700'
                  : 'bg-amber-400 border-amber-500 text-slate-950 hover:bg-amber-300'
              }`}
            >
              {isGuidedPlaying && guidedTopic === 'mirror' ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                  <span>Stop Animasi Cermin</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                  <span>Animasi Penjelasan Cermin</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => onToggleGuidedTopic('eye')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border shadow-sm transition-colors whitespace-nowrap ${
                isGuidedPlaying && guidedTopic === 'eye'
                  ? 'bg-rose-600 border-rose-600 text-white hover:bg-rose-700'
                  : 'bg-emerald-500 border-emerald-600 text-white hover:bg-emerald-400'
              }`}
            >
              {isGuidedPlaying && guidedTopic === 'eye' ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                  <span>Stop Animasi Mata</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                  <span>Animasi Penjelasan Mata</span>
                </>
              )}
            </button>
          </div>

          {activeModule === 'mirror' ? (
            <div className="pointer-events-auto inline-flex flex-wrap items-center gap-x-2.5 gap-y-1 px-3.5 py-1.5 rounded-xl bg-white/[0.95] border border-slate-200/90 shadow-sm text-xs text-slate-700">
              <span className="font-bold text-slate-900">
                {mirrorState.mirrorType === 'concave'
                  ? 'Cermin Cekung (Sendok Dalam)'
                  : 'Cermin Cembung (Kaca Spion)'}
              </span>
              <span className="text-slate-300" aria-hidden="true">
                ·
              </span>
              <span className="font-mono-tabular">
                Jarak Benda: {mirrorState.objectDistanceCm.toFixed(0)} cm
              </span>
              <span className="text-slate-300" aria-hidden="true">
                ·
              </span>
              <span className="font-mono-tabular">
                Fokus (F): {Math.abs(mirrorResult.signedFocalCm).toFixed(0)} cm
              </span>
              <span className="text-slate-300" aria-hidden="true">
                ·
              </span>
              <span className="font-semibold text-orange-700">
                Bayangan: {simpleMirrorSummary}
              </span>
            </div>
          ) : (
            <div className="pointer-events-auto inline-flex flex-wrap items-center gap-x-2.5 gap-y-1 px-3.5 py-1.5 rounded-xl bg-white/[0.95] border border-slate-200/90 shadow-sm text-xs text-slate-700">
              <span className="font-bold text-slate-900">{conditionTitle}</span>
              <span className="text-slate-300" aria-hidden="true">
                ·
              </span>
              <span>
                Kacamata:{' '}
                <strong className="text-slate-900">
                  {eyeState.lensEnabled
                    ? eyeState.lensPowerDiopter < -0.05
                      ? `Lensa Cekung (${eyeState.lensPowerDiopter.toFixed(2)} D)`
                      : eyeState.lensPowerDiopter > 0.05
                      ? `Lensa Cembung (+${eyeState.lensPowerDiopter.toFixed(2)} D)`
                      : 'Netral (0 D)'
                    : 'Belum Dipakai'}
                </strong>
              </span>
              <span className="text-slate-300" aria-hidden="true">
                ·
              </span>
              <span
                className={`font-bold ${
                  eyeResult.isSharp ? 'text-emerald-700' : 'text-red-600'
                }`}
              >
                {simpleEyeFocus}
              </span>
            </div>
          )}
        </div>

        {/* Compact Live "Cara Mata Melihat" Picture-in-Picture Preview (Eye Mode only) */}
        {activeModule === 'eye' ? (
          <div className="pointer-events-auto hidden sm:block w-48 rounded-xl bg-white/[0.96] border border-slate-200 shadow-sm p-2.5 shrink-0">
            <div className="flex items-center justify-between text-[11px] font-semibold mb-1.5">
              <span className="text-slate-700">Penglihatan Mata</span>
              <span
                className={
                  eyeResult.isSharp ? 'text-emerald-700' : 'text-red-600'
                }
              >
                {eyeResult.isSharp ? 'Tajam' : 'Buram'}
              </span>
            </div>
            <div className="h-20 rounded-lg bg-emerald-900 border-2 border-amber-600 flex flex-col items-center justify-center overflow-hidden">
              <div
                className="text-center transition-[filter] duration-150"
                style={{ filter: `blur(${previewBlurPx}px)` }}
              >
                <div className="text-base font-bold tracking-wide text-white leading-tight">
                  IPA KELAS 5
                </div>
                <div className="text-[11px] font-semibold text-amber-200 mt-0.5">
                  {eyeState.objectDistanceFactor > 0.5
                    ? 'Papan Tulis (Jauh)'
                    : 'Buku Cerita (Dekat)'}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden lg:block text-[11px] font-medium text-slate-600 bg-white/[0.9] px-3 py-1.5 rounded-lg border border-slate-200">
            Geser layar untuk memutar 3D · Gulir untuk zoom
          </div>
        )}
      </div>
    </div>
  );
}
