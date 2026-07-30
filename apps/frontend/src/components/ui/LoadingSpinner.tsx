interface LoadingSpinnerProps {
  fullScreen?: boolean;
  label?: string;
}

export const LoadingSpinner = ({ fullScreen = true, label = 'Chargement...' }: LoadingSpinnerProps) => {
  const content = (
    <div className="flex flex-col items-center gap-4 relative z-10">
      <div className="relative w-16 h-16 flex items-center justify-center">
        {/* Glowing aura */}
        <div className="absolute inset-0 rounded-full bg-whatsapp/10 animate-pulse blur-md" />
        
        {/* Ring spinner */}
        <div className="absolute inset-0 rounded-full border-2 border-whatsapp/20" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-whatsapp animate-spin" />
        
        {/* Official WhatsApp Brand SVG logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-whatsapp fill-current">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.863-9.864.001-2.63-1.019-5.101-2.875-6.958C16.546 1.926 14.08 1.9 12.01 1.9c-5.439 0-9.867 4.42-9.87 9.867-.001 1.77.466 3.498 1.354 5.025l-.973 3.558 3.636-.954zm10.985-5.419c-.3-.15-1.77-.875-2.045-.975s-.475-.15-.675.15-.775.975-.95 1.175-.35.225-.65.075c-.3-.15-1.265-.467-2.41-1.485-.89-.794-1.49-1.775-1.665-2.075s-.019-.463.13-.612c.134-.133.3-.35.45-.525.15-.175.2-.3.3-.5s.05-.375-.025-.525-.675-1.625-.925-2.225c-.244-.589-.491-.51-.675-.52l-.575-.01c-.2 0-.525.075-.8.375s-1.05 1.025-1.05 2.5 1.075 2.9 1.225 3.1.2.3 2.15 3.025c1.295 1.812 2.656 2.081 3.25 2.131.594.05 1.25-.075 1.625-.45s.825-1.025.925-1.4 0-.7-.05-.85c-.05-.175-.225-.275-.525-.425z"/>
          </svg>
        </div>
      </div>
      <p className="text-xs text-slate-400 font-bold font-mono tracking-wide">{label}</p>
    </div>
  );

  if (!fullScreen) return content;

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center relative overflow-hidden">
      {/* Background decorations */}
      <div className="hairline-grid pointer-events-none absolute inset-0 h-full w-full [mask-image:radial-gradient(50%_50%_at_50%_50%,#000,transparent)] opacity-30" />
      {content}
    </div>
  );
};