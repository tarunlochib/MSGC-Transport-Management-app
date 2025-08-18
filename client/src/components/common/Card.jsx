import React from 'react';

const Card = ({ 
  children, 
  className = "", 
  padding = "p-6",
  shadow = "shadow-lg",
  hover = true,
  animate = true
}) => {
  const baseClasses = "bg-white/95 backdrop-blur-xl rounded-xl border border-white/40";
  const shadowClass = hover ? `${shadow} hover:shadow-xl` : shadow;
  const animateClass = animate ? "transition-all duration-300 hover:scale-[1.02]" : "";
  
  return (
    <div className={`${baseClasses} ${shadowClass} ${padding} ${animateClass} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
