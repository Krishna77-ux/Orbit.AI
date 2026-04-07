import React from "react";
import { motion } from "framer-motion";

const MorphingCard = ({ icon, title, value, gradient, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, type: "spring" }}
      whileHover={{ scale: 1.05, y: -10 }}
      className="group relative h-40 rounded-2xl overflow-hidden cursor-pointer"
    >
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .morphing-gradient {
          background: linear-gradient(-45deg, ${gradient[0]}, ${gradient[1]}, ${gradient[2]}, ${gradient[3]});
          background-size: 400% 400%;
          animation: gradientShift 8s ease infinite;
        }
        
        .card-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        
        .morphing-card:hover .card-overlay {
          background: rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(15px);
        }
      `}</style>

      <div className="morphing-gradient w-full h-full absolute inset-0" />
      
      <div className="card-overlay" />
      
      <div className="relative h-full p-6 flex flex-col justify-between text-white z-10">
        <div className="text-4xl">{icon}</div>
        <div>
          <p className="text-sm opacity-80 font-mono uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default MorphingCard;
