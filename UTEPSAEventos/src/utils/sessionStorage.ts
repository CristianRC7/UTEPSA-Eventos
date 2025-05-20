import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './Config';

const SESSION_KEY = 'utepsa_session';

export const saveSession = async (userData: any) => {
  try {
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(userData));
    return true;
  } catch (error) {
    console.error('Error saving session:', error);
    return false;
  }
};

export const getSession = async () => {
  try {
    const sessionData = await AsyncStorage.getItem(SESSION_KEY);
    return sessionData ? JSON.parse(sessionData) : null;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

export const clearSession = async () => {
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing session:', error);
    return false;
  }
};

export const changePassword = async (id_usuario: number, nueva_contrasena: string) => {
  try {
    const response = await fetch(`${BASE_URL}/ChangePassword.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_usuario, nueva_contrasena }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    return { success: false, message: 'Error de red' };
  }
};
