import { useApp } from '../../context/useApp';

export default function BigButton({
  children,
  onClick,
  variant = 'amber', // amber, emerald, sky, rose, purple, slate
  size = 'md', // sm, md, lg
  className = '',
  disabled = false,
  ariaLabel,
  icon,
}) {
  const { playTap } = useApp();

  const variantStyles = {
    amber: 'bg-amber-400 hover:bg-amber-500 text-amber-950 border-amber-500',
    emerald: 'bg-emerald-400 hover:bg-emerald-500 text-emerald-950 border-emerald-500',
    sky: 'bg-sky-400 hover:bg-sky-500 text-sky-950 border-sky-500',
    rose: 'bg-rose-400 hover:bg-rose-500 text-rose-950 border-rose-500',
    purple: 'bg-purple-400 hover:bg-purple-500 text-purple-950 border-purple-500',
    slate: 'bg-slate-200 hover:bg-slate-300 text-slate-800 border-slate-300',
  };

  const sizeStyles = {
    sm: 'min-h-[52px] min-w-[52px] px-4 py-2 text-lg rounded-2xl',
    md: 'min-h-[64px] min-w-[64px] px-6 py-3 text-xl md:text-2xl rounded-3xl',
    lg: 'min-h-[80px] min-w-[80px] px-8 py-4 text-2xl md:text-3xl rounded-3xl',
  };

  const handleClick = (e) => {
    if (disabled) return;
    playTap();
    if (onClick) onClick(e);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`btn-tactile inline-flex items-center justify-center font-bold border-2 cursor-pointer select-none active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-amber-300 disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant] || variantStyles.amber} ${sizeStyles[size] || sizeStyles.md} ${className}`}
    >
      {icon && <span className="mr-2 text-2xl">{icon}</span>}
      {children}
    </button>
  );
}
