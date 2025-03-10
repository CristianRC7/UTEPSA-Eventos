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
  Platform,
} from 'react-native';

const { width } = Dimensions.get('window');

const Login = ({ navigation }: any) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  
  // Animations
  const fadeAnim = useState(new Animated.Value(0))[0];
  const moveAnim = useState(new Animated.Value(50))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];
  
  useEffect(() => {
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
  
  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor ingrese usuario y contraseña');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('http://192.168.0.15/Utepsa-Eventos/server/src/Login.php', {
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
        if (data.rol === 'administrador') {
          Alert.alert('Bienvenido', 'Hola admin');
        } else if (data.rol === 'interno' || data.rol === 'externo') {
          navigation.navigate('Home', { userData: data });
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
  
  const titleScale = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

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
          }}>
            <Text style={styles.chip}>UTEPSA</Text>
            <Text style={styles.title}>Eventos</Text>
            <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
          </Animated.View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Usuario</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingrese su usuario"
              placeholderTextColor="#999"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingrese su contraseña"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
          
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>
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
    padding: 25,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  chip: {
    alignSelf: 'flex-start',
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
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
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
  input: {
    height: 55,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
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
});

export default Login;
