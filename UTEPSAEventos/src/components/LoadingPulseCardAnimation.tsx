import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

const CARD_COUNT = 4;
const CARD_HEIGHT = 150;
const CARD_MARGIN = 20;

const LoadingPulseCardAnimation = () => {
  const pulseAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <View style={styles.container}>
      {Array.from({ length: CARD_COUNT }).map((_, idx) => (
        <Animated.View
          key={idx}
          style={[
            styles.card,
            { opacity: pulseAnim },
          ]}
        >
          <View style={styles.titlePulse} />
          <View style={styles.descPulse} />
          <View style={styles.rowPulse}>
            <View style={styles.datePulse} />
            <View style={styles.datePulse} />
          </View>
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 32,
    backgroundColor: '#FFF',
  },
  card: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    padding: 28,
    marginBottom: CARD_MARGIN,
    height: CARD_HEIGHT,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 4,
  },
  titlePulse: {
    width: '65%',
    height: 22,
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    marginBottom: 16,
  },
  descPulse: {
    width: '92%',
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 22,
  },
  rowPulse: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  datePulse: {
    width: '38%',
    height: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
  },
});

export default LoadingPulseCardAnimation;
