interface LogoProps {
  onClick?: () => void;
}

function Logo({ onClick }: LogoProps) {
  return (
    <div className="flex items-center justify-center">
      <img
        src="/Formula ENGAJAMENTO.png"
        alt="Fórmula Engajamento"
        onClick={onClick}
        className="h-32 w-auto object-contain filter drop-shadow-lg animate-float-fade cursor-pointer hover:opacity-90 transition-opacity"
      />
    </div>
  );
}

export default Logo;
