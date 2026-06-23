import { useState, useEffect } from "react";

export function useCountUp(endValue: number, duration: number = 800) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      // Easing out function for smoother stop
      const easeOut = 1 - Math.pow(1 - percentage, 3);
      
      setValue(endValue * easeOut);

      if (percentage < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setValue(endValue);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [endValue, duration]);

  return value;
}
