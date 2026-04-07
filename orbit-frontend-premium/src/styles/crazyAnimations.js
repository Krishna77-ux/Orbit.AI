// Crazy animations and effects
export const crazyAnimations = {
  // Floating animation
  floating: `
    @keyframes floating {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(2deg); }
    }
  `,
  
  // Pulse glow
  pulseGlow: `
    @keyframes pulseGlow {
      0%, 100% { 
        box-shadow: 0 0 20px rgba(168, 85, 247, 0.5),
                    0 0 40px rgba(236, 72, 153, 0.3);
      }
      50% { 
        box-shadow: 0 0 40px rgba(168, 85, 247, 0.8),
                    0 0 60px rgba(236, 72, 153, 0.6);
      }
    }
  `,
  
  // Neon flicker
  neonFlicker: `
    @keyframes neonFlicker {
      0%, 100% { text-shadow: 0 0 10px #00ff88, 0 0 20px #00ff88, 0 0 30px #00ff88; }
      50% { text-shadow: 0 0 5px #00ff88, 0 0 10px #00ff88; }
    }
  `,
  
  // Morphing gradient
  morphGradient: `
    @keyframes morphGradient {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  `,
  
  // Shimmer effect
  shimmer: `
    @keyframes shimmer {
      0% { background-position: -1000px 0; }
      100% { background-position: 1000px 0; }
    }
  `,
  
  // Bounce rotate
  bounceRotate: `
    @keyframes bounceRotate {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      25% { transform: translateY(-10px) rotate(-2deg); }
      75% { transform: translateY(-10px) rotate(2deg); }
    }
  `,
  
  // Cyber pulse
  cyberPulse: `
    @keyframes cyberPulse {
      0%, 100% { 
        box-shadow: 0 0 0px rgba(0, 255, 136, 0.5);
      }
      50% { 
        box-shadow: 0 0 20px rgba(0, 255, 136, 0.8), 0 0 40px rgba(0, 255, 136, 0.4);
      }
    }
  `,
  
  // Aurora wave
  auroraWave: `
    @keyframes auroraWave {
      0% { background-position: 0% center; }
      100% { background-position: 200% center; }
    }
  `,
  
  // Slide in blur
  slideInBlur: `
    @keyframes slideInBlur {
      0% { 
        opacity: 0;
        transform: translateY(30px) blur(10px);
      }
      100% { 
        opacity: 1;
        transform: translateY(0) blur(0);
      }
    }
  `,
  
  // Flip rotate
  flipRotate: `
    @keyframes flipRotate {
      0% { transform: rotateX(0) rotateY(0); }
      50% { transform: rotateX(10deg) rotateY(10deg); }
      100% { transform: rotateX(0) rotateY(0); }
    }
  `,
};

export const getCrazyStyles = () => `
  ${Object.values(crazyAnimations).join('\n')}
  
  .neon-text {
    color: #00ff88;
    text-shadow: 0 0 10px #00ff88, 0 0 20px #00ff88, 0 0 30px #00ff88;
    font-weight: bold;
    letter-spacing: 2px;
    animation: neonFlicker 0.15s infinite;
  }
  
  .cyber-glow {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%);
    background-size: 200% 200%;
    animation: morphGradient 8s ease infinite;
  }
  
  .glass-effect {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  }
  
  .floating-element {
    animation: floating 3s ease-in-out infinite;
  }
  
  .pulse-glow-element {
    animation: pulseGlow 2s ease-in-out infinite;
  }
  
  .shimmer-element {
    background: linear-gradient(90deg, #000 0%, #fff 50%, #000 100%);
    background-size: 200% 100%;
    animation: shimmer 3s infinite;
  }
  
  .bounce-rotate-element {
    animation: bounceRotate 2s ease-in-out infinite;
  }
  
  .cyber-pulse-element {
    animation: cyberPulse 2s ease-in-out infinite;
  }
  
  .aurora-element {
    background: linear-gradient(90deg, #ff00ff, #00ffff, #ff00ff);
    background-size: 200% 100%;
    animation: auroraWave 4s ease infinite;
  }
`;
