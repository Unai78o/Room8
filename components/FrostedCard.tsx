import React from "react";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function FrostedCard({ children, className = "", ...props }: Props) {
  return (
    <div
      className={`bg-[#1a1614]/60 backdrop-blur-xl border border-white/10 rounded-[2rem] hover:border-[#ffb38a]/30 transition-all duration-300 shadow-lg ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}