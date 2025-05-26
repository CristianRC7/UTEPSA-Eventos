import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import Animated, { useSharedValue, useAnimatedScrollHandler, useAnimatedRef, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import onboardingData from '../data/onboardingData';
import Pagination from '../components/Onboarding/Pagination';
import CustomButton from '../components/Onboarding/CustomButton';
import RenderItem from '../components/Onboarding/RenderItem';
import { OnboardingData } from '../types/OnboardingTypes';
import { useNavigation } from '@react-navigation/native';

const SplashScreen = () => {
  const flatListRef = useAnimatedRef<FlatList<OnboardingData>>();
  const x = useSharedValue(0);
  const flatListIndex = useSharedValue(0);
  const navigation = useNavigation<any>();
  const slideAnim = useSharedValue(0); // 0 = visible, 1 = fuera de pantalla
  const fadeAnim = useSharedValue(1); // 1 = opaco, 0 = transparente

  const onViewableItemsChanged = ({ viewableItems }: { viewableItems: any[] }) => {
    if (viewableItems[0]?.index !== null) {
      flatListIndex.value = viewableItems[0].index;
    }
  };

  const onScroll = useAnimatedScrollHandler({
    onScroll: event => {
      x.value = event.contentOffset.x;
    },
  });

  // Animación de slide up + fade out
  const slideOutStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
      transform: [
        { translateY: withTiming(slideAnim.value * -400, { duration: 600 }) },
        { scale: withTiming(1 - slideAnim.value * 0.1, { duration: 600 }) },
      ],
    };
  });

  // Función para disparar la animación y luego navegar
  const handleFinishSplash = () => {
    fadeAnim.value = withTiming(0, { duration: 600 });
    slideAnim.value = withTiming(1, { duration: 600 }, (finished) => {
      if (finished) {
        runOnJS(navigation.reset)({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    });
  };

  return (
    <Animated.View style={[styles.container, slideOutStyle]}>
      <Animated.FlatList
        ref={flatListRef}
        onScroll={onScroll}
        data={onboardingData}
        renderItem={({ item, index }) => <RenderItem item={item} index={index} x={x} />}
        keyExtractor={item => item.id.toString()}
        scrollEventThrottle={16}
        horizontal={true}
        bounces={false}
        pagingEnabled={true}
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{
          minimumViewTime: 300,
          viewAreaCoveragePercentThreshold: 10,
        }}
      />
      <View style={styles.bottomContainer}>
        <Pagination data={onboardingData} x={x} />
        <CustomButton
          flatListRef={flatListRef}
          flatListIndex={flatListIndex}
          dataLength={onboardingData.length}
          x={x}
          onFinishSplash={handleFinishSplash}
        />
      </View>
    </Animated.View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 30,
    paddingVertical: 30,
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
  },
}); 