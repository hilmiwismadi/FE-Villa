import React, { useEffect, useRef, useState } from 'react';

const IMAGES = [
  { src: '/livingroom.jpg', alt: 'Ruang Tamu' },
  { src: '/garden.jpg', alt: 'Taman' },
  { src: '/rooom.jpg', alt: 'Kamar Tidur' },
  { src: '/doorjpg.jpg', alt: 'Pintu Masuk' },
  { src: '/livingroom.jpg', alt: 'Ruang Tamu' },
  { src: '/garden.jpg', alt: 'Taman' },
  { src: '/rooom.jpg', alt: 'Kamar Tidur' },
  { src: '/doorjpg.jpg', alt: 'Pintu Masuk' },
];

const REAL_COUNT = 4;

const VillaCarousel: React.FC = () => {
  const [offset, setOffset] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const animRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const positionRef = useRef(0);

  const CARD_WIDTH = 360;
  const GAP = 24;
  const STRIDE = CARD_WIDTH + GAP;
  const SPEED = 0.025;

  useEffect(() => {
    if (isPaused) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    lastTimeRef.current = performance.now();
    positionRef.current = offset;

    const animate = (time: number) => {
      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;
      positionRef.current += SPEED * delta;

      if (positionRef.current >= (REAL_COUNT * STRIDE)) {
        positionRef.current -= REAL_COUNT * STRIDE;
      }

      setOffset(positionRef.current);
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPaused]);

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

      <div className="overflow-hidden">
        <div
            className="flex"
            style={{
              gap: `${GAP}px`,
              paddingLeft: '32px',
              paddingRight: '32px',
              transform: `translateX(-${offset}px)`,
              willChange: 'transform',
            }}
          >
            {IMAGES.map((img, i) => (
              <div
                key={i}
                className="flex-shrink-0 group"
                style={{ width: `${CARD_WIDTH}px` }}
              >
                <div
                  className="w-full overflow-hidden rounded-lg"
                  style={{ paddingBottom: '100%', position: 'relative' }}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    draggable={false}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
    </div>
  );
};

export default VillaCarousel;
