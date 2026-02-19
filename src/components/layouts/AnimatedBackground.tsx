"use client";

interface AnimatedBackgroundProps {
  backgroundImage?: string;
  enableBlur?: boolean;
}

export function AnimatedBackground({ 
  backgroundImage, 
  enableBlur = true 
}: AnimatedBackgroundProps = {}) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Background Image with Blur Overlay */}
      {backgroundImage && (
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: enableBlur ? 'blur(40px) brightness(0.3)' : 'brightness(0.3)',
            opacity: 0.6,
            transform: 'scale(1.1)',
          }}
        />
      )}
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-purple-800/20" />
      
      {/* Animated Blur Orbs - Purple/Blue Theme */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/40 dark:bg-purple-400/30 rounded-full blur-3xl animate-float" />
      <div className="absolute top-60 -left-40 w-96 h-96 bg-blue-500/40 dark:bg-blue-400/30 rounded-full blur-3xl animate-float animate-pulse-slow" style={{ animationDelay: "2s" }} />
      <div className="absolute bottom-40 right-1/4 w-80 h-80 bg-purple-400/30 dark:bg-purple-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "4s" }} />
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-indigo-500/25 dark:bg-indigo-400/15 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-violet-500/30 dark:bg-violet-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }} />
      <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-cyan-500/20 dark:bg-cyan-400/15 rounded-full blur-3xl animate-float" style={{ animationDelay: "5s" }} />
    </div>
  );
}

