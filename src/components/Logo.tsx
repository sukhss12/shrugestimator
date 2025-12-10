interface LogoProps {
  width?: number;
  className?: string;
}

export const Logo = ({ width = 200, className = '' }: LogoProps) => {
  const height = (width / 200) * 60;
  
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 200 60" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Left arm: ¯\_ */}
      <path 
        d="M10 20 H35 L55 40" 
        stroke="currentColor" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      
      {/* Right arm: _/¯ */}
      <path 
        d="M145 40 L165 20 H190" 
        stroke="currentColor" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      
      {/* Face: (ツ) */}
      <circle cx="85" cy="28" r="3" fill="currentColor"/>
      <circle cx="115" cy="28" r="3" fill="currentColor"/>
      <path 
        d="M88 38 Q100 46 112 38" 
        stroke="currentColor" 
        strokeWidth="3" 
        strokeLinecap="round" 
        fill="none"
      />
    </svg>
  );
};
