'use client';

import LottiePlayer from '@/components/ui/lottie-player';
import { useMapLoading } from '@/components/map-loading-context';

const ConditionalLottie = () => {
  const { isMapLoaded } = useMapLoading();
  return <LottiePlayer isVisible={!isMapLoaded} />;
};

export default ConditionalLottie;
