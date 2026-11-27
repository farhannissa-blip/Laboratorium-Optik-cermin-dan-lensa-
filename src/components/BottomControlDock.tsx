import {
  Camera,
  ChevronDown,
  ChevronUp,
  Eye,
  Flashlight,
  Headphones,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  SlidersHorizontal,
  Sparkles,
  Upload,
} from 'lucide-react';
import { useState } from 'react';
import {
  CameraPresetId,
  EyeCondition,
  EyeLabState,
  EyeOpticsResult,
  LabModule,
  MirrorLabState,
  MirrorObjectType,
  MirrorOpticsResult,
  NarrationSegment,
} from '../types/optics';
import { getOptimalDiopter } from '../utils/opticsMath';

type DockTab = 'primary' | 'secondary' | 'camera' | 'audio';

interface BottomControlDockProps {
  activeModule: LabModule;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mirrorState: MirrorLabState;
  mirrorResult: MirrorOpticsResult;
  onChangeMirror: (patch: Partial<MirrorLabState>) => void;
  onResetMirror: () => void;
  eyeState: EyeLabState;
  eyeResult: EyeOpticsResult;
  onChangeEye: (patch: Partial<EyeLabState>) => void;
  onResetEye: () => void;
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
  onSelectCamera: (preset: CameraPresetId) => void;
  currentSegment: NarrationSegment;
  isPlaying: boolean;
  isTtsSpeaking: boolean;
  audioCurrentTime: number;
  audioDuration: number;
  hasAudio: boolean;
  onTogglePlay: () => void;
  onPrevSegment: () => void;
  onNextSegment: () => void;
  onSeekAudio: (timeSec: number) => void;
  onOpenNarrationStudio: () => void;
}

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '00:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function BottomControlDock({
  activeModule,
  collapsed,
  onToggleCollapse,
  mirrorState,
  mirrorResult,
  onChangeMirror,
  onResetMirror,
  eyeState,
  eyeResult,
  onChangeEye,
  onResetEye,
  autoRotate,
  onToggleAutoRotate,
  onSelectCamera,
  currentSegment,
  isPlaying,
  isTtsSpeaking,
  audioCurrentTime,
  audioDuration,
  hasAudio,
  onTogglePlay,
  onPrevSegment,
  onNextSegment,
  onSeekAudio,
  onOpenNarrationStudio,
}: BottomControlDockProps) {
  const [activeTab, setActiveTab] = useState<DockTab>('primary');

  const objectOptions: Array<{ id: MirrorObjectType; label: string }> = [
    { id: 'robot', label: 'Robot' },
    { id: 'candle', label: 'Lilin' },
    { id: 'tree', label: 'Pohon' },
    { id: 'pencil', label: 'Pensil' },
  ];

  const handleApplyOptimalCorrection = () => {
    const optD = getOptimalDiopter(
      eyeState.condition,
      eyeState.objectDistanceFactor
    );
    onChangeEye({
      lensEnabled: eyeState.condition !== 'normal',
      lensPowerDiopter: optD,
    });
  };

  const handleSelectEyeCondition = (condition: EyeCondition) => {
    const nextDist = condition === 'hyperopia' ? 0.0 : 1.0;
    const nextOptD = getOptimalDiopter(condition, nextDist);
    onChangeEye({
      condition,
      objectDistanceFactor: nextDist,
      lensEnabled: false,
      lensPowerDiopter: nextOptD,
    });
  };

  return (
    <div className="fixed bottom-4 inset-x-0 z-20 px-3 sm:px-6 pointer-events-none flex justify-center">
      <div
        className="w-full max-w-[940px] flex flex-col items-center transition-transform duration-200 ease-out"
        style={{
          transform: collapsed
            ? 'translateY(calc(100% - 34px))'
            : 'translateY(0)',
        }}
      >
        {/* Collapse / Expand Handle */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="pointer-events-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 bg-white border border-b-0 border-slate-200 rounded-t-lg shadow-sm transition-colors"
        >
          {collapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Tampilkan Kontrol (H)</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Sembunyikan Kontrol (H)</span>
            </>
          )}
        </button>

        {/* Main Dock Surface — Solid/RGBA bright white (no backdrop-filter over WebGL) */}
        <section
          aria-label="Panel Kontrol Praktikum SD Kelas 5"
          className="pointer-events-auto w-full rounded-2xl bg-white/[0.97] border border-slate-200 shadow-xl overflow-hidden"
        >
          {/* Tab Bar */}
          <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-slate-200 bg-slate-50/90">
            <div className="flex items-center gap-1 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('primary')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'primary'
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
                <span>
                  {activeModule === 'mirror'
                    ? 'Cermin, Fokus & Benda'
                    : 'Kondisi Mata & Kacamata'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('secondary')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'secondary'
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                {activeModule === 'mirror' ? (
                  <Flashlight className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                <span>
                  {activeModule === 'mirror'
                    ? 'Lampu Senter & Sinar'
                    : 'Intip Dalam Mata'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('camera')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'camera'
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <Camera className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Sudut Pandang</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('audio')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'audio'
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <Headphones className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Suara Narasi</span>
              </button>
            </div>

            <button
              type="button"
              onClick={activeModule === 'mirror' ? onResetMirror : onResetEye}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-200/70 transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Ulangi</span>
            </button>
          </div>

          {/* Tab Panel Body */}
          <div className="px-5 py-3.5">
            {/* === MIRROR LAB: TAB 1 === */}
            {activeModule === 'mirror' && activeTab === 'primary' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-3 items-center">
                {/* Mirror Type + Object Picker */}
                <div className="md:col-span-4 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-700">
                      Cermin
                    </span>
                    <div className="inline-flex p-0.5 rounded-lg bg-slate-100 border border-slate-200">
                      <button
                        type="button"
                        onClick={() =>
                          onChangeMirror({ mirrorType: 'concave' })
                        }
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                          mirrorState.mirrorType === 'concave'
                            ? 'bg-sky-600 text-white'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Cekung
                      </button>
                      <button
                        type="button"
                        onClick={() => onChangeMirror({ mirrorType: 'convex' })}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                          mirrorState.mirrorType === 'convex'
                            ? 'bg-sky-600 text-white'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Cembung
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-700">
                      Benda
                    </span>
                    <div className="inline-flex p-0.5 rounded-lg bg-slate-100 border border-slate-200">
                      {objectOptions.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => onChangeMirror({ objectType: opt.id })}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                            mirrorState.objectType === opt.id
                              ? 'bg-slate-900 text-white'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Dynamic Distance & Focus Sliders */}
                <div className="md:col-span-5 flex flex-col gap-2.5">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <label
                        htmlFor="slider-s"
                        className="font-semibold text-slate-700"
                      >
                        Jarak Benda ke Cermin
                      </label>
                      <span className="font-mono-tabular font-semibold text-sky-700">
                        {mirrorState.objectDistanceCm.toFixed(0)} cm
                      </span>
                    </div>
                    <input
                      id="slider-s"
                      type="range"
                      min={4}
                      max={48}
                      step={1}
                      value={mirrorState.objectDistanceCm}
                      onChange={(e) =>
                        onChangeMirror({
                          objectDistanceCm: parseFloat(e.target.value),
                        })
                      }
                      className="optical-slider"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <label
                        htmlFor="slider-f"
                        className="font-semibold text-slate-700"
                      >
                        Jarak Titik Fokus (F)
                      </label>
                      <span className="font-mono-tabular font-semibold text-orange-700">
                        {Math.abs(mirrorResult.signedFocalCm).toFixed(0)} cm
                      </span>
                    </div>
                    <input
                      id="slider-f"
                      type="range"
                      min={6}
                      max={22}
                      step={1}
                      value={mirrorState.focalLengthCm}
                      onChange={(e) =>
                        onChangeMirror({
                          focalLengthCm: parseFloat(e.target.value),
                        })
                      }
                      className="optical-slider"
                    />
                  </div>
                </div>

                {/* Mirror Tilt + Quick Fun Presets for Grade 5 */}
                <div className="md:col-span-3 flex flex-col gap-2.5">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <label
                        htmlFor="slider-rot"
                        className="font-semibold text-slate-700"
                      >
                        Putar Cermin
                      </label>
                      <span className="font-mono-tabular font-semibold text-slate-800">
                        {mirrorState.mirrorRotationDeg > 0 ? '+' : ''}
                        {mirrorState.mirrorRotationDeg}°
                      </span>
                    </div>
                    <input
                      id="slider-rot"
                      type="range"
                      min={-18}
                      max={18}
                      step={1}
                      value={mirrorState.mirrorRotationDeg}
                      onChange={(e) =>
                        onChangeMirror({
                          mirrorRotationDeg: parseFloat(e.target.value),
                        })
                      }
                      className="optical-slider"
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        onChangeMirror({
                          mirrorType: 'concave',
                          focalLengthCm: 14,
                          objectDistanceCm: 8,
                          objectType: 'robot',
                          mirrorRotationDeg: 0,
                        })
                      }
                      className="flex-1 px-2 py-1 text-[11px] font-semibold rounded-md bg-amber-100 text-amber-900 hover:bg-amber-200 transition-colors whitespace-nowrap"
                    >
                      Cermin Rias
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onChangeMirror({
                          mirrorType: 'convex',
                          focalLengthCm: 12,
                          objectDistanceCm: 24,
                          objectType: 'tree',
                          mirrorRotationDeg: 0,
                        })
                      }
                      className="flex-1 px-2 py-1 text-[11px] font-semibold rounded-md bg-sky-100 text-sky-900 hover:bg-sky-200 transition-colors whitespace-nowrap"
                    >
                      Kaca Spion
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* === MIRROR LAB: TAB 2 (Flashlight & Ray Toggles) === */}
            {activeModule === 'mirror' && activeTab === 'secondary' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-3 items-center">
                <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <label
                        htmlFor="slider-lx"
                        className="font-semibold text-slate-700"
                      >
                        Jarak Senter
                      </label>
                      <span className="font-mono-tabular font-semibold text-orange-700">
                        {mirrorState.lightSourceXCm.toFixed(0)} cm
                      </span>
                    </div>
                    <input
                      id="slider-lx"
                      type="range"
                      min={12}
                      max={50}
                      step={1}
                      value={mirrorState.lightSourceXCm}
                      onChange={(e) =>
                        onChangeMirror({
                          lightSourceXCm: parseFloat(e.target.value),
                        })
                      }
                      className="optical-slider"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <label
                        htmlFor="slider-ly"
                        className="font-semibold text-slate-700"
                      >
                        Tinggi Senter
                      </label>
                      <span className="font-mono-tabular font-semibold text-orange-700">
                        {mirrorState.lightSourceYCm > 0 ? '+' : ''}
                        {mirrorState.lightSourceYCm.toFixed(0)} cm
                      </span>
                    </div>
                    <input
                      id="slider-ly"
                      type="range"
                      min={-6}
                      max={14}
                      step={1}
                      value={mirrorState.lightSourceYCm}
                      onChange={(e) =>
                        onChangeMirror({
                          lightSourceYCm: parseFloat(e.target.value),
                        })
                      }
                      className="optical-slider"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <label
                        htmlFor="slider-la"
                        className="font-semibold text-slate-700"
                      >
                        Lebar Sinar
                      </label>
                      <span className="font-mono-tabular font-semibold text-slate-800">
                        {mirrorState.lightBeamAngleDeg.toFixed(0)}°
                      </span>
                    </div>
                    <input
                      id="slider-la"
                      type="range"
                      min={4}
                      max={20}
                      step={1}
                      value={mirrorState.lightBeamAngleDeg}
                      onChange={(e) =>
                        onChangeMirror({
                          lightBeamAngleDeg: parseFloat(e.target.value),
                        })
                      }
                      className="optical-slider"
                    />
                  </div>
                </div>

                <div className="md:col-span-5 flex flex-wrap gap-2">
                  {[
                    {
                      key: 'showPrincipalRays' as const,
                      label: 'Garis Sinar Benda',
                    },
                    {
                      key: 'showLightSourceRays' as const,
                      label: 'Lampu Senter',
                    },
                    {
                      key: 'showVirtualExtensions' as const,
                      label: 'Garis Putus Maya',
                    },
                    { key: 'showScreen' as const, label: 'Layar Putih' },
                    { key: 'showLabels' as const, label: 'Label Nama' },
                  ].map((item) => {
                    const active = mirrorState[item.key];
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() =>
                          onChangeMirror({ [item.key]: !active })
                        }
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                          active
                            ? 'bg-sky-100 border-sky-400 text-sky-900'
                            : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* === EYE LAB: TAB 1 (Conditions & Corrective Glasses) === */}
            {activeModule === 'eye' && activeTab === 'primary' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-3 items-center">
                {/* Eye Condition Selector */}
                <div className="md:col-span-5 flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-slate-700">
                    Pilih Kondisi Mata
                  </span>
                  <div className="inline-flex p-0.5 rounded-lg bg-slate-100 border border-slate-200">
                    {(
                      [
                        { id: 'normal', label: 'Mata Sehat' },
                        { id: 'myopia', label: 'Rabun Jauh (Miopia)' },
                        { id: 'hyperopia', label: 'Rabun Dekat' },
                      ] as const
                    ).map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectEyeCondition(c.id)}
                        className={`flex-1 px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                          eyeState.condition === c.id
                            ? 'bg-sky-600 text-white'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                  <span className="text-[11px] font-medium text-slate-600">
                    Bantuan:{' '}
                    {eyeState.condition === 'myopia'
                      ? 'Kacamata Minus (Lensa Cekung)'
                      : eyeState.condition === 'hyperopia'
                      ? 'Kacamata Plus (Lensa Cembung)'
                      : 'Tidak perlu kacamata'}
                  </span>
                </div>

                {/* Glasses Toggle + Diopter Slider */}
                <div className="md:col-span-4 flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onChangeEye({ lensEnabled: !eyeState.lensEnabled })
                      }
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                        eyeState.lensEnabled
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-slate-900 border-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                      {eyeState.lensEnabled
                        ? 'Lepas Kacamata'
                        : 'Pasang Kacamata'}
                    </button>

                    {eyeState.condition !== 'normal' && (
                      <button
                        type="button"
                        onClick={handleApplyOptimalCorrection}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-100 text-amber-900 hover:bg-amber-200 transition-colors whitespace-nowrap"
                      >
                        <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Pasangkan Lensa Pas!</span>
                      </button>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <label
                        htmlFor="slider-diopter"
                        className="font-semibold text-slate-700"
                      >
                        Kekuatan Lensa
                      </label>
                      <span className="font-mono-tabular font-semibold text-sky-700">
                        {eyeState.lensPowerDiopter > 0 ? '+' : ''}
                        {eyeState.lensPowerDiopter.toFixed(2)} D (
                        {eyeState.lensPowerDiopter < -0.05
                          ? 'Cekung'
                          : eyeState.lensPowerDiopter > 0.05
                          ? 'Cembung'
                          : 'Netral'}
                        )
                      </span>
                    </div>
                    <input
                      id="slider-diopter"
                      type="range"
                      min={-5}
                      max={5}
                      step={0.25}
                      value={eyeState.lensPowerDiopter}
                      onChange={(e) =>
                        onChangeEye({
                          lensEnabled: true,
                          lensPowerDiopter: parseFloat(e.target.value),
                        })
                      }
                      className="optical-slider"
                    />
                  </div>
                </div>

                {/* Target Viewing Distance */}
                <div className="md:col-span-3 flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs">
                    <label
                      htmlFor="slider-eyedist"
                      className="font-semibold text-slate-700"
                    >
                      Jarak Benda
                    </label>
                    <span className="font-semibold text-slate-900">
                      {eyeState.objectDistanceFactor > 0.65
                        ? 'Jauh'
                        : eyeState.objectDistanceFactor < 0.35
                        ? 'Dekat'
                        : 'Sedang'}
                    </span>
                  </div>
                  <input
                    id="slider-eyedist"
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={eyeState.objectDistanceFactor}
                    onChange={(e) =>
                      onChangeEye({
                        objectDistanceFactor: parseFloat(e.target.value),
                      })
                    }
                    className="optical-slider"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Baca Buku</span>
                    <span>Papan Tulis</span>
                  </div>
                </div>
              </div>
            )}

            {/* === EYE LAB: TAB 2 (Anatomy & Rays) === */}
            {activeModule === 'eye' && activeTab === 'secondary' && (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { key: 'cutawayMode' as const, label: 'Garis Batas Mata' },
                    { key: 'showRays' as const, label: 'Tampilkan Sinar Cahaya' },
                    { key: 'showLabels' as const, label: 'Label Bagian Mata' },
                  ].map((item) => {
                    const active = eyeState[item.key];
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => onChangeEye({ [item.key]: !active })}
                        className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                          active
                            ? 'bg-sky-100 border-sky-400 text-sky-900'
                            : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => onSelectCamera('retina')}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-orange-100 text-orange-900 hover:bg-orange-200 transition-colors whitespace-nowrap"
                >
                  Lihat Layar Retina Lebih Dekat
                </button>
              </div>
            )}

            {/* === TAB 3: Camera Presets === */}
            {activeTab === 'camera' && (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {(activeModule === 'mirror'
                    ? [
                        { id: 'perspective' as const, label: 'Sudut 3D Seru' },
                        { id: 'side' as const, label: 'Dari Samping' },
                        { id: 'top' as const, label: 'Dari Atas' },
                        { id: 'front' as const, label: 'Hadap Cermin' },
                      ]
                    : [
                        { id: 'perspective' as const, label: 'Sudut 3D Seru' },
                        { id: 'side' as const, label: 'Dari Samping' },
                        { id: 'retina' as const, label: 'Dekat Layar Retina' },
                        { id: 'front' as const, label: 'Depan Kacamata' },
                      ]
                  ).map((cam) => (
                    <button
                      key={cam.id}
                      type="button"
                      onClick={() => onSelectCamera(cam.id)}
                      className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 border border-slate-200 text-slate-800 hover:border-sky-400 hover:bg-sky-50 transition-colors whitespace-nowrap"
                    >
                      {cam.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={onToggleAutoRotate}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                    autoRotate
                      ? 'bg-sky-600 text-white border-sky-600'
                      : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
                  }`}
                >
                  {autoRotate ? 'Putar Otomatis: Aktif' : 'Putar Otomatis 360°'}
                </button>
              </div>
            )}

            {/* === TAB 4: Integrated Audio Narration Player === */}
            {activeTab === 'audio' && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={onPrevSegment}
                    aria-label="Bab sebelumnya"
                    className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-950 transition-colors"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onTogglePlay}
                    aria-label={
                      isPlaying || isTtsSpeaking ? 'Jeda narasi' : 'Putar narasi'
                    }
                    className="p-2.5 rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors"
                  >
                    {isPlaying || isTtsSpeaking ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={onNextSegment}
                    aria-label="Bab berikutnya"
                    className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-950 transition-colors"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 min-w-0 w-full">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold text-slate-900 truncate">
                      {currentSegment.title}
                    </span>
                    <span className="text-[11px] font-mono-tabular text-slate-600 shrink-0">
                      {hasAudio
                        ? `${formatTime(audioCurrentTime)} / ${formatTime(audioDuration)}`
                        : isTtsSpeaking
                        ? 'Membacakan Naskah...'
                        : 'Siap dibacakan'}
                    </span>
                  </div>
                  {hasAudio ? (
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
                      aria-label="Garis waktu audio narasi"
                      className="optical-slider"
                    />
                  ) : (
                    <p className="text-[11px] text-slate-500 truncate">
                      Klik Putar untuk mendengarkan pratinjau suara, atau unggah rekaman voiceover Anda.
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onOpenNarrationStudio}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
                >
                  <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Naskah &amp; Upload</span>
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
