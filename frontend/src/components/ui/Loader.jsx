import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = ({ className = '', size = 24, text }) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader2 
        size={size} 
        className="animate-spin text-primary" 
      />
      {text && <span className="mt-2 text-sm text-muted-foreground">{text}</span>}
    </div>
  );
};

export const FullPageLoader = ({ text }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
    <Loader size={48} text={text} />
  </div>
);

export default Loader;
