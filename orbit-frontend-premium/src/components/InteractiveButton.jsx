import React from "react";
import { motion } from "framer-motion";

const InteractiveButton = ({ children, onClick, variant = "primary", icon = "🚀", ...props }) => {
  const variants = {
    primary: "bg-gradient-to-r from-green-500 via-cyan-500 to-blue-500",
    secondary: "bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500",
    danger: "bg-gradient-to-r from-red-500 via-orange-500 to-red-500",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.07, y: -3 }}
      whileTap={{ scale: 0.93 }}
      onClick={onClick}
      className={`${variants[variant]} text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all overflow-hidden relative group`}
      {...props}
    >
      <style>{`
        @keyframes shimmerButton {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        
        .button-shimmer {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 20%;
          background: rgba(255, 255, 255, 0.3);
          animation: shimmerButton 2s infinite;
        }
      `}</style>
      
      <div className="button-shimmer pointer-events-none" />
      
      <span className="relative flex items-center justify-center gap-2">
        {icon} {children}
      </span>
    </motion.button>
  );
};

export default InteractiveButton;
