// [Layer: LANDING_PAGE/Features/Pages/Home/Components]
// BookHero3D.tsx -- Three.js 3D hardcover book hero cluster with dynamic lighting and parallax.
// Mounts static 3D scene engine from Assets/threejs/bookHeroScene.ts.
// DO NOT put business logic or API calls here.
import { FC, useEffect, useRef } from 'react';
import { initBookHeroScene } from '../../../../../Assets/threejs/bookHeroScene';

export const BookHero3D: FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const controller = initBookHeroScene(containerRef.current);
    return () => {
      controller.destroy();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[480px] sm:min-h-[520px] lg:min-h-[580px] relative pointer-events-auto"
      style={{ overflow: 'hidden' }}
    />
  );
};

export default BookHero3D;
