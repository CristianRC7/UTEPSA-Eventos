import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated } from 'react-native';

interface LoadingPulseProps {
  width: number | string;
  height: number | string;
  backgroundColor?: string;
}

const LoadingPulse = ({ 
  width, 
  height, 
  backgroundColor = '#E5E7EB' 
}: LoadingPulseProps) => {
  const pulseAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    
    pulseAnimation.start();
    
    return () => {
      pulseAnimation.stop();
    };
  }, []);

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          width,
          height,
          backgroundColor,
          opacity: pulseAnim
        }
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 4,
  }
});

export default LoadingPulse;