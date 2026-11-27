import { memo, useEffect, useRef } from 'react';
import { OpticsSceneManager } from '../three/OpticsSceneManager';
import {
  CameraPresetId,
  EyeLabState,
  LabModule,
  MirrorLabState,
} from '../types/optics';

interface OpticsCanvasProps {
  activeModule: LabModule;
  mirrorState: MirrorLabState;
  eyeState: EyeLabState;
  autoRotate: boolean;
  cameraCommand: { preset: CameraPresetId; seq: number };
}

export const OpticsCanvas = memo(function OpticsCanvas({
  activeModule,
  mirrorState,
  eyeState,
  autoRotate,
  cameraCommand,
}: OpticsCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const managerRef = useRef<OpticsSceneManager | null>(null);

  // Store initial props in refs so WebGLRenderer initializes strictly once
  const initModuleRef = useRef(activeModule);
  const initMirrorRef = useRef(mirrorState);
  const initEyeRef = useRef(eyeState);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const manager = new OpticsSceneManager(
      container,
      initModuleRef.current,
      initMirrorRef.current,
      initEyeRef.current
    );
    managerRef.current = manager;

    return () => {
      manager.dispose();
      managerRef.current = null;
    };
  }, []);

  useEffect(() => {
    managerRef.current?.setModule(activeModule);
  }, [activeModule]);

  useEffect(() => {
    managerRef.current?.updateMirrorState(mirrorState);
  }, [mirrorState]);

  useEffect(() => {
    managerRef.current?.updateEyeState(eyeState);
  }, [eyeState]);

  useEffect(() => {
    managerRef.current?.setAutoRotate(autoRotate);
  }, [autoRotate]);

  useEffect(() => {
    if (cameraCommand.seq > 0) {
      managerRef.current?.setCameraPreset(cameraCommand.preset, false);
    }
  }, [cameraCommand]);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 w-screen h-screen overflow-hidden touch-none select-none cursor-grab active:cursor-grabbing"
      aria-label="Kanvas simulasi laboratorium optik 3D interaktif"
    />
  );
});
