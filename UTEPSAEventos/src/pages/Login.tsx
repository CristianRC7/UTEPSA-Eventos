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
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { saveSession, getSession } from '../utils/sessionStorage';
import { BASE_URL } from '../utils/Config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Animated as RNAnimated } from 'react-native';

const Login = ({ navigation }: any) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [_isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Animación solo para el botón (usando Animated de react-native)
  const buttonAnim = useState(new RNAnimated.Value(0))[0];

  // Animación de entrada para todo el contenido
  const formAnim = useSharedValue(0);

  useEffect(() => {
    // Check if user is already logged in
    const checkForExistingSession = async () => {
      const userSession = await getSession();
      if (userSession) {
        // Redirect to Home if a session exists
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
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    formAnim.value = withTiming(1, { duration: 900 });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [navigation, formAnim]);

  // Button animation on press
  const animateButton = () => {
    RNAnimated.sequence([
      RNAnimated.timing(buttonAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      RNAnimated.timing(buttonAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor ingrese usuario y contraseña');
      return;
    }

    animateButton();
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
        // Save session data
        await saveSession(data);

        if (data.rol === 'administrador') {
          Alert.alert('Bienvenido', 'Hola admin');
        } else if (data.rol === 'interno' || data.rol === 'externo') {
          // Use reset instead of navigate to prevent going back to login
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home', params: { userData: data } }],
          });
        }
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
      'Envíe un correo a soporte.campusvirutal@utepsa.edu',
      [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
    );
  };

  const handleResetSplash = async () => {
    await AsyncStorage.removeItem('splash_shown');
    await AsyncStorage.removeItem('userSession'); // si tu sesión se guarda así
    navigation.reset({
      index: 0,
      routes: [{ name: 'Splash' }],
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: formAnim.value,
    transform: [
      { translateY: (1 - formAnim.value) * 30 },
      { scale: formAnim.value ? 1 : 0.95 },
    ],
  }));

  if (checkingSession) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={{ marginTop: 20, fontSize: 16, color: '#666' }}>Verificando sesión...</Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* Botón de desarrollo para resetear splash */}
        <TouchableOpacity onPress={handleResetSplash} style={{ marginBottom: 10, alignSelf: 'flex-end', backgroundColor: '#eee', padding: 8, borderRadius: 8 }}>
          <Text style={{ color: '#cf152d', fontWeight: 'bold' }}>Reset Splash (DEV)</Text>
        </TouchableOpacity>
        <Animated.View style={[styles.formContainer, animatedStyle]}>
          <View style={{ 
            marginBottom: 40,
            alignItems: 'center',
          }}>
            <Animated.Text style={[styles.utepsaTitle, animatedStyle]}>UTEPSA</Animated.Text>
            <Animated.Text style={[styles.eventosTitle, animatedStyle]}>Eventos</Animated.Text>
            <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Usuario</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="person" size={20} color="#666" style={styles.inputIcon} />
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
            <View style={styles.inputWrapper}>
              <MaterialIcons name="lock" size={20} color="#666" style={styles.inputIcon} />
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
                  name={showPassword ? "visibility-off" : "visibility"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleLogin}
            disabled={loading}
          >
            <Animated.View 
              style={[
                styles.loginButton,
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
              )}
            </Animated.View>
          </TouchableOpacity>

          <View style={styles.forgotPasswordContainer}>
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
  },
  utepsaTitle: {
    fontSize: 44,
    fontWeight: '900',
    color: '#cf152d',
    letterSpacing: 2,
    textShadowColor: '#00000022',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
    textAlign: 'center',
  },
  eventosTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  chip: {
    display: 'none',
  },
  title: {
    display: 'none',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 55,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 12,
    backgroundColor: '#F9F9F9',
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
    color: '#000',
  },
  loginButton: {
    backgroundColor: '#cf152d',
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#cf152d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  forgotPasswordContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#cf152d',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default Login;