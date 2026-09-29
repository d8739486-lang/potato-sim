import { motion } from 'framer-motion';

export const SnowEffect = () => {
  const snowflakes = Array.from({ length: 50 });

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {snowflakes.map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: `${Math.random() * 100}vw`, 
            y: -10, 
            opacity: Math.random() * 0.5 + 0.3,
            scale: Math.random() * 0.5 + 0.5
          }}
          animate={{ 
            y: '110vh',
            x: `${(Math.random() - 0.5) * 5 + (i % 100)}vw` // Subtle horizontal drift
          }}
          transition={{ 
            duration: Math.random() * 5 + 5, 
            repeat: Infinity, 
            ease: "linear",
            delay: Math.random() * 10
          }}
          className="absolute w-2 h-2 bg-white rounded-full blur-[1px]"
        />
      ))}
    </div>
  );
};
