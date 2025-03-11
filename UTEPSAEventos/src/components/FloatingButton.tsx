import React, { useState } from 'react';
import { 
  TouchableOpacity, 
  StyleSheet, 
  Animated, 
  View, 
  Text,
  Modal,
  TouchableWithoutFeedback
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
  iconName = 'add',
  backgroundColor = '#000',
  size = 60,
  iconColor = '#FFFFFF',
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
          <Icon name={iconName} size={iconSize} color={iconColor} />
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
                <Icon name="photo-camera" size={24} color="#333" />
                <Text style={styles.menuText}>Publicar Fotos</Text>
              </TouchableOpacity>
              
              <View style={styles.menuDivider} />
              
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={handleMyPublications}
              >
                <Icon name="photo-library" size={24} color="#333" />
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingRight: 25,
    paddingBottom: 100,
  },
  menuContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 8,
  },
  menuText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#EFEFEF',
    marginHorizontal: 8,
  },
});

export default FloatingButton;
