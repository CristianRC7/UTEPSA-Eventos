import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, BackHandler, Alert } from 'react-native';
import Login from './src/pages/Login';
import Home from './src/pages/Home';
import MyPublication from './src/pages/MyPublication';
import FormPublication from './src/components/FormPublication';
import DashboardEvent from './src/pages/DashboardEvent';
import { getSession } from './src/utils/sessionStorage';

// Global function for handling back button press
const handleBackPress = () => {
  Alert.alert(
    'Salir',
    '¿Desea salir de la aplicación?',
    [
      {
        text: 'No',
        onPress: () => null,
        style: 'cancel',
      },
      { text: 'Sí', onPress: () => BackHandler.exitApp() },
    ],
    { cancelable: false }
  );
  return true; // Prevent default behavior
};

const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(true);
  const [userSession, setUserSession] = useState<any>(null);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const session = await getSession();
      if (session) {
        setUserSession(session);
      }
      setIsLoading(false);
    };

    checkSession();
    
    // Handle Android back button globally
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    return () => backHandler.remove();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      </SafeAreaProvider>
    );
  }

 return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <NavigationContainer>
        <Stack.Navigator
          id="main-stack"
          initialRouteName={userSession ? "Home" : "Login"}
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: '#FFFFFF',
            },
            animation: 'fade_from_bottom',
          }}
        >
          <Stack.Screen 
            name="Login" 
            component={Login} 
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen 
            name="Home" 
            component={Home} 
            initialParams={{ userData: userSession }}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen name="MyPublication" component={MyPublication} />
          <Stack.Screen name="FormPublication" component={FormPublication} />
          <Stack.Screen name="DashboardEvent" component={DashboardEvent} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
