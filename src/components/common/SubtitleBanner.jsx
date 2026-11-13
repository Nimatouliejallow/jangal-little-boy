import { useApp } from '../../context/useApp';

export default function SubtitleBanner({ onRepeat = null }) {
  const { subtitle, speak, settings } = useApp();

  if (!subtitle) return null;

  const handleRepeat = () => {
    if (onRepeat) {
      onRepeat();
    } else {
      speak(subtitle);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto my-3 px-4">
      <div className="bg-white/95 backdrop-blur-xs border-2 border-amber-300 rounded-3xl p-3 shadow-md flex items-center justify-between gap-3 transition-all animate-pop">
        <button
          type="button"
          onClick={handleRepeat}
          aria-label="Repeat spoken instruction"
          className="shrink-0 w-12 h-12 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-800 flex items-center justify-center text-2xl active:scale-90 transition-transform cursor-pointer border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          🔊
        </button>

        <p className="flex-1 text-center font-bold text-slate-800 text-lg md:text-xl leading-snug">
          {subtitle}
        </p>

        {!settings.speechEnabled && (
          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-lg border border-slate-200">
            Muted
          </span>
        )}
      </div>
    </div>
  );
}
