import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { saveSession, getSession } from '../utils/sessionStorage';
import { BASE_URL } from '../utils/Config';

const { width } = Dimensions.get('window');

const Login = ({ navigation }: any) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  
  // Animations
  const fadeAnim = useState(new Animated.Value(0))[0];
  const moveAnim = useState(new Animated.Value(50))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];
  const buttonAnim = useState(new Animated.Value(0))[0];
  
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
    
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(moveAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
    
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

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  
  // Button animation on press
  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnim, {
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
  
  const titleScale = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });
  
  const buttonScale = buttonAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.95],
  });

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
        <Animated.View 
          style={[
            styles.formContainer,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: moveAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          <Animated.View style={{ 
            transform: [{ scale: titleScale }],
            marginBottom: 40,
            alignItems: 'center',
          }}>
            <Text style={styles.chip}>UTEPSA</Text>
            <Text style={styles.title}>Eventos</Text>
            <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
          </Animated.View>
          
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
                { transform: [{ scale: buttonScale }] }
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
  chip: {
    alignSelf: 'center',
    backgroundColor: '#f0f0f3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 25,
    marginBottom: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    letterSpacing: -0.5,
    textAlign: 'center',
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
    backgroundColor: '#000',
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  forgotPasswordContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#666',
    fontSize: 14,
  },
});

export default Login;