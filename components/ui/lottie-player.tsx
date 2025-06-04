'use client';

import Lottie from 'lottie-react';
import animationData from '@/public/images/Q zoom.json';

interface LottiePlayerProps {
  isVisible: boolean;
}

const LottiePlayer: React.FC<LottiePlayerProps> = ({ isVisible }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.8)', // Optional: background overlay
      zIndex: 9999 // Ensure it's on top
    }}>
      <Lottie animationData={animationData} style={{ width: 300, height: 300 }} loop={true} />
    </div>
  );
};

export default LottiePlayer;
