import React, { useState } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Animated,
  View,
  Text,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

interface FloatingButtonProps {
  onPress?: () => void;
  iconName?: string;
  backgroundColor?: string;
  size?: number;
  iconColor?: string;
  iconSize?: number;
}

const FloatingButton = ({
  onPress,
  iconName = 'menu',
  backgroundColor = '#cf152d',
  size = 60,
  iconColor = '#fff',
  iconSize = 30,
}: FloatingButtonProps) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const navigation = useNavigation();
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

  const toggleMenu = () => {
    if (onPress) {
      onPress();
    } else {
      setMenuVisible(!menuVisible);
    }
  };

  const handlePublishPhotos = () => {
    setMenuVisible(false);
    // @ts-ignore - TypeScript doesn't know about our custom screens
    navigation.navigate('FormPublication');
  };

  const handleMyPublications = () => {
    setMenuVisible(false);
    // @ts-ignore - TypeScript doesn't know about our custom screens
    navigation.navigate('MyPublication');
  };

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={toggleMenu}
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
          <Icon name={menuVisible ? 'menu-open' : iconName} size={iconSize} color={iconColor} />
        </Animated.View>
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.menuContainer}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handlePublishPhotos}
              >
                <Icon name="photo-camera" size={24} color="#cf152d" />
                <Text style={styles.menuText}>Publicar Fotos</Text>
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleMyPublications}
              >
                <Icon name="photo-library" size={24} color="#cf152d" />
                <Text style={styles.menuText}>Mis Publicaciones</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingRight: 25,
    paddingBottom: 160,
  },
  menuContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 8,
    minWidth: 200,
    borderWidth: 1.5,
    borderColor: '#cf152d',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  menuText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  menuDivider: {
    height: 2,
    backgroundColor: '#cf152d22',
    marginHorizontal: 8,
  },
});

export default FloatingButton;
