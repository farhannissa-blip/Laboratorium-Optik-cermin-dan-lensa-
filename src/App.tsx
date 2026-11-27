/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BottomControlDock } from './components/BottomControlDock';
import { NarrationDrawer } from './components/NarrationDrawer';
import { OpticsCanvas } from './components/OpticsCanvas';
import { TopBar } from './components/TopBar';
import {
  DEFAULT_EYE_STATE,
  DEFAULT_MIRROR_STATE,
  NARRATION_SEGMENTS,
} from './data/narrationScripts';
import {
  CameraPresetId,
  EyeLabState,
  LabModule,
  MirrorLabState,
  NarrationSegment,
  UploadedVoiceoverRecord,
} from './types/optics';
import {
  deleteVoiceoverFile,
  loadAllCustomScripts,
  loadAllVoiceovers,
  saveCustomScript,
  saveVoiceoverFile,
} from './utils/audioStorage';
import { computeEyeOptics, computeMirrorOptics } from './utils/opticsMath';
import { evaluateChapterChoreography } from './utils/guidedAnimation';

export default function App() {
  const [activeModule, setActiveModule] = useState<LabModule>('mirror');
  const [mirrorState, setMirrorState] =
    useState<MirrorLabState>(DEFAULT_MIRROR_STATE);
  const [eyeState, setEyeState] = useState<EyeLabState>(DEFAULT_EYE_STATE);

  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [cameraCommand, setCameraCommand] = useState<{
    preset: CameraPresetId;
    seq: number;
  }>({ preset: 'perspective', seq: 0 });

  // Structured Narration & Voiceover state
  const [narrationOpen, setNarrationOpen] = useState(false);
  const [activeSegmentId, setActiveSegmentId] = useState<string>(
    NARRATION_SEGMENTS[0].id
  );
  const [voiceovers, setVoiceovers] = useState<
    Record<string, UploadedVoiceoverRecord>
  >({});
  const [customScripts, setCustomScripts] = useState<Record<string, string>>(
    {}
  );
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTtsSpeaking, setIsTtsSpeaking] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [guidedTopic, setGuidedTopic] = useState<LabModule | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentObjectUrlRef = useRef<string | null>(null);
  const loadedSourceKeyRef = useRef<string>('');
  const lastCameraPresetRef = useRef<CameraPresetId | undefined>(undefined);

  const mirrorResult = useMemo(
    () => computeMirrorOptics(mirrorState),
    [mirrorState]
  );
  const eyeResult = useMemo(() => computeEyeOptics(eyeState), [eyeState]);

  const currentSegment = useMemo(
    () =>
      NARRATION_SEGMENTS.find((s) => s.id === activeSegmentId) ??
      NARRATION_SEGMENTS[0],
    [activeSegmentId]
  );

  // Load persisted uploaded voiceovers & custom scripts from IndexedDB on mount
  useEffect(() => {
    let active = true;
    Promise.all([loadAllVoiceovers(), loadAllCustomScripts()]).then(
      ([savedAudio, savedScripts]) => {
        if (!active) return;
        setVoiceovers(savedAudio);
        setCustomScripts(savedScripts);
      }
    );
    return () => {
      active = false;
    };
  }, []);

  // Keyboard shortcut: 'H' collapses/expands the bottom control dock
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'h' || e.key === 'H') {
        setDockCollapsed((c) => !c);
      } else if (e.key === 'Escape' && narrationOpen) {
        setNarrationOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [narrationOpen]);

  const stopAllAudio = useCallback((clearGuided = true) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsTtsSpeaking(false);
    if (clearGuided) {
      setGuidedTopic(null);
      setAutoRotate(false);
    }
  }, []);

  const triggerCameraPreset = useCallback((preset: CameraPresetId) => {
    setCameraCommand((prev) => ({ preset, seq: prev.seq + 1 }));
  }, []);

  const applySegmentScene = useCallback(
    (segment: NarrationSegment) => {
      const { preset } = { preset: segment.scenePreset.cameraPreset };
      setActiveModule(segment.scenePreset.module);
      if (segment.scenePreset.mirrorPatch) {
        setMirrorState((prev) => ({
          ...prev,
          ...segment.scenePreset.mirrorPatch,
        }));
      }
      if (segment.scenePreset.eyePatch) {
        setEyeState((prev) => ({
          ...prev,
          ...segment.scenePreset.eyePatch,
        }));
      }
      if (preset) {
        triggerCameraPreset(preset);
      }
    },
    [triggerCameraPreset]
  );

  // Sync audio element source when active segment or its uploaded voiceover changes
  useEffect(() => {
    const seg =
      NARRATION_SEGMENTS.find((s) => s.id === activeSegmentId) ??
      NARRATION_SEGMENTS[0];
    const record = voiceovers[activeSegmentId];
    const nextKey = record
      ? `custom:${seg.id}:${record.updatedAt}`
      : seg.defaultAudioUrl
      ? `builtin:${seg.defaultAudioUrl}`
      : '';

    if (loadedSourceKeyRef.current === nextKey) {
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;

    if (currentObjectUrlRef.current) {
      URL.revokeObjectURL(currentObjectUrlRef.current);
      currentObjectUrlRef.current = null;
    }

    if (record) {
      const url = URL.createObjectURL(record.blob);
      currentObjectUrlRef.current = url;
      audio.src = url;
      audio.load();
    } else if (seg.defaultAudioUrl) {
      audio.src = seg.defaultAudioUrl;
      audio.load();
    } else {
      audio.removeAttribute('src');
      audio.load();
    }
    loadedSourceKeyRef.current = nextKey;
    setAudioCurrentTime(0);
    setAudioDuration(0);
  }, [activeSegmentId, voiceovers]);

  // Cleanup audio & TTS on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (currentObjectUrlRef.current) {
        URL.revokeObjectURL(currentObjectUrlRef.current);
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const playSegmentAudio = useCallback(
    (segment: NarrationSegment, keepGuided = false) => {
      stopAllAudio(!keepGuided);
      setActiveSegmentId(segment.id);
      lastCameraPresetRef.current = segment.scenePreset.cameraPreset;
      applySegmentScene(segment);

      const record = voiceovers[segment.id];
      const builtInUrl = segment.defaultAudioUrl;
      if (!record && !builtInUrl) return;

      const nextKey = record
        ? `custom:${segment.id}:${record.updatedAt}`
        : `builtin:${builtInUrl}`;

      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      const audio = audioRef.current;

      if (loadedSourceKeyRef.current !== nextKey) {
        if (currentObjectUrlRef.current) {
          URL.revokeObjectURL(currentObjectUrlRef.current);
          currentObjectUrlRef.current = null;
        }
        if (record) {
          const url = URL.createObjectURL(record.blob);
          currentObjectUrlRef.current = url;
          audio.src = url;
        } else if (builtInUrl) {
          audio.src = builtInUrl;
        }
        loadedSourceKeyRef.current = nextKey;
        setAudioCurrentTime(0);
        setAudioDuration(0);
      }
      audio.currentTime = 0;

      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    },
    [applySegmentScene, stopAllAudio, voiceovers]
  );

  const handleStartGuidedTopic = useCallback(
    (topic: LabModule) => {
      if (guidedTopic === topic && (isPlaying || isTtsSpeaking)) {
        stopAllAudio(true);
        return;
      }
      const firstSeg = NARRATION_SEGMENTS.find((s) => s.module === topic);
      if (!firstSeg) return;
      setNarrationOpen(false);
      setGuidedTopic(topic);
      playSegmentAudio(firstSeg, true);
    },
    [guidedTopic, isPlaying, isTtsSpeaking, playSegmentAudio, stopAllAudio]
  );

  const speakSegmentTts = useCallback(
    (segment: NarrationSegment) => {
      stopAllAudio();
      setActiveSegmentId(segment.id);
      applySegmentScene(segment);

      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        return;
      }

      const text = customScripts[segment.id] ?? segment.defaultScript;
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'id-ID';
      utter.rate = 0.98;
      utter.onstart = () => setIsTtsSpeaking(true);
      utter.onend = () => {
        setIsTtsSpeaking(false);
        if (autoAdvance) {
          const idx = NARRATION_SEGMENTS.findIndex((s) => s.id === segment.id);
          const next = NARRATION_SEGMENTS[idx + 1];
          if (next) {
            setTimeout(() => {
              if (voiceovers[next.id]) {
                playSegmentAudio(next);
              } else {
                speakSegmentTts(next);
              }
            }, 350);
          }
        }
      };
      utter.onerror = () => setIsTtsSpeaking(false);
      window.speechSynthesis.speak(utter);
    },
    [
      applySegmentScene,
      autoAdvance,
      customScripts,
      playSegmentAudio,
      stopAllAudio,
      voiceovers,
    ]
  );

  // Wire HTMLAudioElement progress & auto-advance listeners
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;

    const onTimeUpdate = () => setAudioCurrentTime(audio.currentTime || 0);
    const onLoadedMeta = () => setAudioDuration(audio.duration || 0);
    const onPause = () => setIsPlaying(false);
    const onPlay = () => setIsPlaying(true);
    const onEnded = () => {
      setIsPlaying(false);
      const idx = NARRATION_SEGMENTS.findIndex((s) => s.id === activeSegmentId);
      const next = NARRATION_SEGMENTS[idx + 1];

      if (guidedTopic) {
        if (next && next.module === guidedTopic) {
          playSegmentAudio(next, true);
        } else {
          // Finished all chapters of this guided topic cleanly
          setGuidedTopic(null);
          setAutoRotate(false);
        }
        return;
      }

      if (autoAdvance && next) {
        if (voiceovers[next.id] || next.defaultAudioUrl) {
          playSegmentAudio(next, false);
        } else {
          setActiveSegmentId(next.id);
          applySegmentScene(next);
        }
      }
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMeta);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMeta);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('ended', onEnded);
    };
  }, [
    activeSegmentId,
    applySegmentScene,
    autoAdvance,
    guidedTopic,
    playSegmentAudio,
    voiceovers,
  ]);

  // Smooth real-time 3D choreography synced to active voiceover playback (throttled ~12Hz for mobile efficiency)
  useEffect(() => {
    if (!guidedTopic || !isPlaying) return;

    const timer = window.setInterval(() => {
      const audio = audioRef.current;
      if (!audio || audio.paused || !Number.isFinite(audio.duration) || audio.duration <= 0) {
        return;
      }
      const progress = Math.max(0, Math.min(1, audio.currentTime / audio.duration));
      const frame = evaluateChapterChoreography(activeSegmentId, progress);

      if (frame.mirrorPatch) {
        setMirrorState((prev) => {
          let changed = false;
          for (const [k, v] of Object.entries(frame.mirrorPatch!)) {
            if ((prev as unknown as Record<string, unknown>)[k] !== v) {
              changed = true;
              break;
            }
          }
          return changed ? { ...prev, ...frame.mirrorPatch } : prev;
        });
      }
      if (frame.eyePatch) {
        setEyeState((prev) => {
          let changed = false;
          for (const [k, v] of Object.entries(frame.eyePatch!)) {
            if ((prev as unknown as Record<string, unknown>)[k] !== v) {
              changed = true;
              break;
            }
          }
          return changed ? { ...prev, ...frame.eyePatch } : prev;
        });
      }
      if (typeof frame.autoRotate === 'boolean') {
        setAutoRotate(frame.autoRotate);
      }
      if (frame.cameraPreset && frame.cameraPreset !== lastCameraPresetRef.current) {
        lastCameraPresetRef.current = frame.cameraPreset;
        triggerCameraPreset(frame.cameraPreset);
      }
    }, 85);

    return () => window.clearInterval(timer);
  }, [activeSegmentId, guidedTopic, isPlaying, triggerCameraPreset]);

  const handleTogglePlay = () => {
    if (isPlaying || isTtsSpeaking) {
      stopAllAudio();
      return;
    }
    const hasAudio = Boolean(
      voiceovers[currentSegment.id] || currentSegment.defaultAudioUrl
    );
    if (hasAudio) {
      if (audioRef.current && audioRef.current.src) {
        applySegmentScene(currentSegment);
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      } else {
        playSegmentAudio(currentSegment);
      }
    } else {
      speakSegmentTts(currentSegment);
    }
  };

  const handleStepSegment = (delta: number) => {
    stopAllAudio();
    const idx = NARRATION_SEGMENTS.findIndex((s) => s.id === activeSegmentId);
    const nextIdx =
      (idx + delta + NARRATION_SEGMENTS.length) % NARRATION_SEGMENTS.length;
    const target = NARRATION_SEGMENTS[nextIdx];
    setActiveSegmentId(target.id);
    applySegmentScene(target);
  };

  const handleSelectModule = (mod: LabModule) => {
    setActiveModule(mod);
    const matchingSeg = NARRATION_SEGMENTS.find((s) => s.module === mod);
    if (matchingSeg && currentSegment.module !== mod && !isPlaying && !isTtsSpeaking) {
      setActiveSegmentId(matchingSeg.id);
    }
  };

  const handleUploadVoiceover = async (segmentId: string, file: File) => {
    const saved = await saveVoiceoverFile(segmentId, file);
    setVoiceovers((prev) => ({ ...prev, [segmentId]: saved }));
  };

  const handleDeleteVoiceover = async (segmentId: string) => {
    if (segmentId === activeSegmentId) {
      stopAllAudio();
    }
    await deleteVoiceoverFile(segmentId);
    setVoiceovers((prev) => {
      const next = { ...prev };
      delete next[segmentId];
      return next;
    });
  };

  const handleUpdateScript = (segmentId: string, nextText: string) => {
    setCustomScripts((prev) => ({ ...prev, [segmentId]: nextText }));
    void saveCustomScript(segmentId, nextText);
  };

  const handleResetScript = (segmentId: string) => {
    const def = NARRATION_SEGMENTS.find((s) => s.id === segmentId);
    if (!def) return;
    setCustomScripts((prev) => {
      const next = { ...prev };
      delete next[segmentId];
      return next;
    });
    void saveCustomScript(segmentId, def.defaultScript);
  };

  const handleSeekAudio = (sec: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = sec;
      setAudioCurrentTime(sec);
    }
  };

  const activeCaptionText =
    customScripts[currentSegment.id] ?? currentSegment.defaultScript;

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#1B2738] text-slate-900">
      {/* Full-bleed 3D Optical Simulation Viewport */}
      <OpticsCanvas
        activeModule={activeModule}
        mirrorState={mirrorState}
        eyeState={eyeState}
        autoRotate={autoRotate}
        cameraCommand={cameraCommand}
      />

      {/* Top Navigation & Friendly Live Optical Summary */}
      <TopBar
        activeModule={activeModule}
        onSelectModule={handleSelectModule}
        onOpenNarration={() => setNarrationOpen(true)}
        uploadedCount={
          NARRATION_SEGMENTS.filter(
            (s) => Boolean(voiceovers[s.id] || s.defaultAudioUrl)
          ).length
        }
        totalSegments={NARRATION_SEGMENTS.length}
        mirrorState={mirrorState}
        mirrorResult={mirrorResult}
        eyeState={eyeState}
        eyeResult={eyeResult}
        guidedTopic={guidedTopic}
        isGuidedPlaying={Boolean(guidedTopic && (isPlaying || isTtsSpeaking))}
        onToggleGuidedTopic={handleStartGuidedTopic}
      />

      {/* Non-obstructive Subtitle Caption Bar when audio narration or guided animation is playing */}
      {(isPlaying || isTtsSpeaking) && !narrationOpen && (
        <div className="fixed top-36 sm:top-32 inset-x-0 px-3 sm:px-4 z-20 pointer-events-none flex justify-center">
          <div className="pointer-events-auto max-w-2xl w-full px-4 py-2.5 rounded-xl bg-white/[0.97] border border-sky-300 shadow-lg flex items-center justify-between gap-3">
            <div className="min-w-0 text-left">
              <div className="text-[11px] font-bold text-sky-700 mb-0.5 truncate">
                {guidedTopic === 'mirror'
                  ? `Animasi Cermin · ${currentSegment.title}`
                  : guidedTopic === 'eye'
                  ? `Animasi Mata · ${currentSegment.title}`
                  : currentSegment.title}
              </div>
              <p className="text-xs leading-relaxed text-slate-800 line-clamp-2">
                {activeCaptionText}
              </p>
            </div>
            <button
              type="button"
              onClick={() => stopAllAudio(true)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors whitespace-nowrap shrink-0"
            >
              Hentikan
            </button>
          </div>
        </div>
      )}

      {/* Unified Collapsible Bottom Control Dock */}
      <BottomControlDock
        activeModule={activeModule}
        collapsed={dockCollapsed}
        onToggleCollapse={() => setDockCollapsed((c) => !c)}
        mirrorState={mirrorState}
        mirrorResult={mirrorResult}
        onChangeMirror={(patch) =>
          setMirrorState((prev) => ({ ...prev, ...patch }))
        }
        onResetMirror={() => {
          setMirrorState(DEFAULT_MIRROR_STATE);
          triggerCameraPreset('perspective');
        }}
        eyeState={eyeState}
        eyeResult={eyeResult}
        onChangeEye={(patch) => setEyeState((prev) => ({ ...prev, ...patch }))}
        onResetEye={() => {
          setEyeState(DEFAULT_EYE_STATE);
          triggerCameraPreset('perspective');
        }}
        autoRotate={autoRotate}
        onToggleAutoRotate={() => setAutoRotate((v) => !v)}
        onSelectCamera={triggerCameraPreset}
        currentSegment={currentSegment}
        isPlaying={isPlaying}
        isTtsSpeaking={isTtsSpeaking}
        audioCurrentTime={audioCurrentTime}
        audioDuration={audioDuration}
        hasAudio={Boolean(
          voiceovers[currentSegment.id] || currentSegment.defaultAudioUrl
        )}
        onTogglePlay={handleTogglePlay}
        onPrevSegment={() => handleStepSegment(-1)}
        onNextSegment={() => handleStepSegment(1)}
        onSeekAudio={handleSeekAudio}
        onOpenNarrationStudio={() => setNarrationOpen(true)}
      />

      {/* Structured Narration Script & Voiceover Upload Studio Modal */}
      <NarrationDrawer
        open={narrationOpen}
        onClose={() => setNarrationOpen(false)}
        segments={NARRATION_SEGMENTS}
        activeSegmentId={activeSegmentId}
        onSelectSegment={(seg, sync) => {
          stopAllAudio();
          setActiveSegmentId(seg.id);
          if (sync) applySegmentScene(seg);
        }}
        customScripts={customScripts}
        onUpdateScript={handleUpdateScript}
        onResetScript={handleResetScript}
        voiceovers={voiceovers}
        onUploadVoiceover={handleUploadVoiceover}
        onDeleteVoiceover={handleDeleteVoiceover}
        isPlaying={isPlaying}
        isTtsSpeaking={isTtsSpeaking}
        audioCurrentTime={audioCurrentTime}
        audioDuration={audioDuration}
        autoAdvance={autoAdvance}
        onToggleAutoAdvance={() => setAutoAdvance((v) => !v)}
        onPlaySegment={playSegmentAudio}
        onStopPlayback={stopAllAudio}
        onSeekAudio={handleSeekAudio}
        onSpeakTts={speakSegmentTts}
      />
    </main>
  );
}
