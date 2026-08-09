import React, { useEffect, useState } from 'react';

interface RotatingBannerProps {
  slides: string[];
  intervalMs?: number;
}

export default function RotatingBanner({ slides, intervalMs = 5000 }: RotatingBannerProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [slides, intervalMs]);

  return (
    <div className="relative overflow-hidden rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
      <p className="text-sm text-primary animate-fade-in">{slides[index]}</p>
    </div>
  );
}
