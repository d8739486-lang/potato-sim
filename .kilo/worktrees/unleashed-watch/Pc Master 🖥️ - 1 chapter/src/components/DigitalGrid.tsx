export const DigitalGrid = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #0DFF4A 1px, transparent 1px),
            linear-gradient(to bottom, #0DFF4A 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle at center, black, transparent 80%)'
        }}
      />
      <div 
        className="absolute inset-0 opacity-[0.05] animate-[pulse_4s_infinite]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #0DFF4A 1px, transparent 1px),
            linear-gradient(to bottom, #0DFF4A 1px, transparent 1px)
          `,
          backgroundSize: '200px 200px',
        }}
      />
    </div>
  );
};
