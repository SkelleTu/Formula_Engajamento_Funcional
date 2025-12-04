import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  onClick: () => void;
  className?: string;
}

function BackButton({ onClick, className = '' }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500/10 to-purple-500/10 hover:from-pink-500/20 hover:to-purple-500/20 border border-pink-500/30 hover:border-pink-500/50 rounded-lg transition-all duration-300 ${className}`}
      aria-label="Voltar"
    >
      <ArrowLeft className="w-5 h-5 text-pink-400 group-hover:text-pink-300 transition-colors" />
      <span className="text-pink-300 group-hover:text-pink-200 font-medium transition-colors">Voltar</span>
    </button>
  );
}

export default BackButton;
