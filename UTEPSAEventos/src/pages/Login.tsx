import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  StatusBar,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { saveSession, getSession } from '../utils/sessionStorage';
import { BASE_URL } from '../utils/Config';
//import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import Logo from '../images/logo.png';

const Login = ({ navigation }: any) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [_isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Animaciones
  const logoAnim = useSharedValue(0);
  const formAnim = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  const contentOffset = useSharedValue(0);

  useEffect(() => {
    // Check if user is already logged in
    const checkForExistingSession = async () => {
      const userSession = await getSession();
      if (userSession) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home', params: { userData: userSession } }],
        });
      }
      setCheckingSession(false);
    };

    checkForExistingSession();

    // Keyboard listeners
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        contentOffset.value = withTiming(-150, { duration: 300 });
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        contentOffset.value = withTiming(0, { duration: 300 });
      }
    );

    // Iniciar animaciones
    logoAnim.value = withSpring(1, { damping: 15, stiffness: 150 });
    formAnim.value = withTiming(1, { duration: 800 });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [navigation, logoAnim, formAnim, contentOffset]);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor ingrese usuario y contraseña');
      return;
    }

    // Animación del botón
    buttonScale.value = withSpring(0.95, { duration: 100 }, () => {
      buttonScale.value = withSpring(1, { duration: 100 });
    });

    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/Login.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario: username,
          contrasena: password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.rol === 'interno' || data.rol === 'externo') {
          await saveSession(data);
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home', params: { userData: data } }],
          });
        }
        return;
      } else {
        Alert.alert('Error', data.message || 'Credenciales inválidas');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Problema de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Recuperar contraseña',
      'Envíe un correo a soporte.campusvirtual@utepsa.edu o al 3er piso, Bloque Este oficina de CTE',
      [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
    );
  };
{/*
  const handleResetSplash = async () => {
    await AsyncStorage.removeItem('splash_shown');
    await AsyncStorage.removeItem('userSession');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Splash' }],
    });
  };
*/}
  // Estilos animados
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoAnim.value,
    transform: [
      { scale: interpolate(logoAnim.value, [0, 1], [0.5, 1]) },
      { translateY: interpolate(logoAnim.value, [0, 1], [-50, 0]) }
    ],
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formAnim.value,
    transform: [
      { translateY: interpolate(formAnim.value, [0, 1], [30, 0]) }
    ],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: contentOffset.value }],
  }));

  if (checkingSession) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#cf152d" />
        <ActivityIndicator size="large" color="#cf152d" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#cf152d" />

        <Animated.View style={[styles.contentContainer, contentAnimatedStyle]}>
          {/* Header con gradiente */}
          <View style={styles.header}>
            <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
              <Image source={Logo} style={styles.logo} resizeMode="contain" />
              <View style={styles.titleContainer}>
                <Text style={styles.utepsaTitle}>UTEPSA</Text>
                <Text style={styles.eventosTitle}>Eventos</Text>
              </View>
            </Animated.View>
          </View>

          {/* Formulario */}
          <Animated.View style={[styles.formContainer, formAnimatedStyle]}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Usuario</Text>
              <View style={[styles.inputWrapper, username ? styles.inputFocused : null]}>
                <MaterialIcons name="person-outline" size={22} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.inputWithIcon}
                  placeholder="Ingrese su usuario"
                  placeholderTextColor="#999"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={[styles.inputWrapper, password ? styles.inputFocused : null]}>
                <MaterialIcons name="lock-outline" size={22} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.inputWithIcon}
                  placeholder="Ingrese su contraseña"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIconContainer}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <MaterialIcons
                    name={showPassword ? 'visibility-off' : 'visibility'}
                    size={22}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <Animated.View style={buttonAnimatedStyle}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleLogin}
                disabled={loading}
                style={styles.loginButton}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <MaterialIcons name="login" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                    <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity
              onPress={handleForgotPassword}
              style={styles.forgotPasswordContainer}
            >
              <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        {/* Botón de desarrollo (comentado para producción)
        {typeof __DEV__ !== 'undefined' && __DEV__ && (
          <TouchableOpacity onPress={handleResetSplash} style={styles.devButton}>
            <Text style={styles.devButtonText}>Reset Splash (DEV)</Text>
          </TouchableOpacity>
        )}*/}
      </View>
    </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#cf152d',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 15,
  },
  titleContainer: {
    alignItems: 'center',
  },
  utepsaTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 3,
    textAlign: 'center',
  },
  eventosTitle: {
    fontSize: 18,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: 2,
    textAlign: 'center',
    opacity: 0.9,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 20,
    minHeight: 400,
  },
  welcomeContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 25,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    marginLeft: 5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    borderRadius: 16,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 5,
  },
  inputFocused: {
    borderColor: '#cf152d',
    backgroundColor: '#FFFFFF',
    shadowColor: '#cf152d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    paddingHorizontal: 15,
  },
  eyeIconContainer: {
    paddingHorizontal: 15,
    height: '100%',
    justifyContent: 'center',
  },
  inputWithIcon: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#cf152d',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#cf152d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonIcon: {
    marginRight: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  forgotPasswordContainer: {
    marginTop: 30,
    alignItems: 'center',
    paddingVertical: 10,
  },
  forgotPasswordText: {
    color: '#cf152d',
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  devButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 8,
    zIndex: 1000,
  },
  devButtonText: {
    color: '#cf152d',
    fontWeight: 'bold',
    fontSize: 12,
  },
  contentContainer: {
    flex: 1,
  },
});

export default Login;
