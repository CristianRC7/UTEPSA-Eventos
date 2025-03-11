import React from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface FloatingButtonProps {
  onPress: () => void;
  iconName?: string;
  backgroundColor?: string;
  size?: number;
  iconColor?: string;
  iconSize?: number;
}

const FloatingButton = ({
  onPress,
  iconName = 'add',
  backgroundColor = '#000',
  size = 60,
  iconColor = '#FFFFFF',
  iconSize = 30,
}: FloatingButtonProps) => {
  const scaleAnimation = React.useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => {
    Animated.timing(scaleAnimation, {
      toValue: 0.9,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.timing(scaleAnimation, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.button,
          {
            backgroundColor,
            width: size,
            height: size,
            borderRadius: size / 2,
            transform: [{ scale: scaleAnimation }],
          },
        ]}
      >
        <Icon name={iconName} size={iconSize} color={iconColor} />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
});

export default FloatingButton;
