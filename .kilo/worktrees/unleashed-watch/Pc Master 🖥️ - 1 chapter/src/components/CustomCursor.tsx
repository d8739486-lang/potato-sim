import { useEffect, useState } from 'react';

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hidden, setHidden] = useState(true);
  const [clicking, setClicking] = useState(false);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (hidden) setHidden(false);
    };

    const onMouseLeave = () => setHidden(true);
    const onMouseEnter = () => setHidden(false);
    const onMouseDown = () => setClicking(true);
    const onMouseUp = () => setClicking(false);

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [hidden]);

  if (hidden) return null;

  return (
    <div
      className="fixed top-0 left-0 pointer-events-none z-9999999 will-change-transform"
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${clicking ? 0.9 : 1})`,
        transformOrigin: 'top left',
        transition: 'transform 0.05s linear'
      }}
    >
      {/* Fallback size w-6 h-6 so it feels like a standard cursor size */}
      <img 
        src="/cursor.png" 
        alt="cursor" 
        className="w-8 h-8 select-none pointer-events-none"
        style={{ 
          filter: `
            drop-shadow(0.5px 0.5px 0 white) 
            drop-shadow(-0.5px -0.5px 0 white) 
            drop-shadow(0.5px -0.5px 0 white) 
            drop-shadow(-0.5px 0.5px 0 white)
            drop-shadow(2px 2px 3px rgba(0,0,0,0.4))
          ` 
        }}
      />
    </div>
  );
}
