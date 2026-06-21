'use client';
import { useRive, Layout, Fit, Alignment } from '@rive-app/react-canvas';

export default function RiveLogo({ size = 32 }: { size?: number }) {
  const { RiveComponent } = useRive({
    src: 'https://cdn.rive.app/animations/vehicles.riv',
    stateMachines: 'bumpy',
    autoplay: true,
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
  });

  return (
    <div style={{ width: size, height: size }} className="hover:scale-110 transition-transform cursor-pointer">
      <RiveComponent />
    </div>
  );
}
