import { useEffect, useRef } from 'react';
import { useApp } from '../../context/useApp';
import BigButton from './BigButton';

export default function ConfettiModal({ isOpen, onClose, onPlayAgain, activityTitle = 'Activity' }) {
  const { profile, playFanfare, playTap } = useApp();
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    playFanfare();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Generate 60 colorful confetti particles
    const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#eab308'];
    const particles = Array.from({ length: 60 }).map(() => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 50,
      size: 8 + Math.random() * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: 2 + Math.random() * 4,
      speedX: -2 + Math.random() * 4,
      rotation: Math.random() * 360,
      rotationSpeed: -4 + Math.random() * 8,
    }));

    let startTime = Date.now();

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotationSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      if (Date.now() - startTime < 4000) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isOpen, playFanfare]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-10 w-full h-full"
      />

      <div className="relative z-20 w-full max-w-md bg-white rounded-3xl p-6 md:p-8 shadow-2xl border-4 border-amber-300 text-center animate-pop">
        <div className="text-7xl mb-3 animate-bounce">
          🌟
        </div>

        <h2 className="text-3xl md:text-4xl font-extrabold text-amber-900 mb-2">
          Jàngal Super Star!
        </h2>

        <p className="text-xl text-slate-700 font-semibold mb-6">
          Wonderful job, <span className="text-amber-600 font-bold">{profile.nickname || 'Little Explorer'}</span>! You completed {activityTitle} and earned a shiny star!
        </p>

        <div className="flex flex-col gap-3">
          <BigButton
            variant="amber"
            size="lg"
            onClick={() => {
              playTap();
              if (onPlayAgain) onPlayAgain();
            }}
            icon="🔄"
          >
            Play Again!
          </BigButton>

          <BigButton
            variant="slate"
            size="md"
            onClick={() => {
              playTap();
              if (onClose) onClose();
            }}
            icon="🏠"
          >
            Go Home
          </BigButton>
        </div>
      </div>
    </div>
  );
}
