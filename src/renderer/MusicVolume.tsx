import { useEffect, useRef, useState } from 'react';

interface MusicVolumeProps {
  targetVolume: number;
}

export default function UseMusicVolume(props: MusicVolumeProps): number {
  const [volume, setVolume] = useState<number>(0);
  const fadeTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeDuration = 0.5;
  const fadeInterval = 50;

  useEffect(() => {
    if (fadeTimer.current) {
      clearInterval(fadeTimer.current); // Clear previous fade
    }
    const startVolume = volume;
    const volumeDiff = props.targetVolume - startVolume;
    const steps = Math.floor((fadeDuration * 1000) / fadeInterval);
    const volumeStep = volumeDiff / steps;
    let currentStep = 0;

    fadeTimer.current = setInterval(() => {
      currentStep++;
      const newVolume = startVolume + volumeStep * currentStep;
      setVolume(newVolume); // Update audio volume

      if (currentStep >= steps) {
        clearInterval(fadeTimer.current!);
        fadeTimer.current = null;
      }
    }, fadeInterval);

    // Cleanup on component unmount or targetVolume change
    return () => {
      if (fadeTimer.current) {
        clearInterval(fadeTimer.current);
        fadeTimer.current = null;
      }
    };
  }, [props.targetVolume]); // Re-run effect when these change

  return volume;
}
