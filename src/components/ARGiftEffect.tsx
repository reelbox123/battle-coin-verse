import { useEffect, useState } from "react";

interface ARGiftEffectProps {
  show: boolean;
  icon: string;
  onComplete: () => void;
}

export const ARGiftEffect = ({ show, icon, onComplete }: ARGiftEffectProps) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    if (!show) return;

    // Create particles
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
    }));
    setParticles(newParticles);

    const timer = setTimeout(() => {
      setParticles([]);
      onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {/* Main gift animation */}
      <div className="absolute inset-0 flex items-center justify-center animate-in zoom-in-50 fade-in duration-500">
        <div className="text-[150px] animate-bounce" style={{ textShadow: "0 0 40px rgba(139, 92, 246, 0.8)" }}>
          {icon}
        </div>
      </div>

      {/* Particle effects */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 bg-gradient-battle rounded-full animate-ping"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${Math.random() * 0.5}s`,
          }}
        />
      ))}

      {/* Sparkle effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent animate-pulse" />
    </div>
  );
};
