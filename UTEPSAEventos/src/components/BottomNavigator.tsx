import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HomeScreen from '../pages/HomeScreen';
import PublicacionesScreen from '../pages/PostScreen';
import Profile from '../pages/Profile';

const Tab = createBottomTabNavigator();

// Main TabNavigator Component
const BottomNavigator = ({ route }: any) => {
  const { userData } = route.params || {};
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';
          
          if (route.name === 'Inicio') {
            iconName = 'home';
          } else if (route.name === 'Publicaciones') {
            iconName = 'photo-library';
          } else if (route.name === 'Perfil') {
            iconName = 'person';
          }
          
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          paddingVertical: 5,
          height: 60,
          borderTopWidth: 1,
          borderTopColor: '#EFEFEF',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          paddingBottom: 5,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Inicio" 
        component={HomeScreen} 
        initialParams={{ userData }} 
      />
      <Tab.Screen name="Publicaciones" component={PublicacionesScreen} />
      <Tab.Screen 
        name="Perfil" 
        component={Profile} 
        initialParams={{ userData }} 
      />
    </Tab.Navigator>
  );
};

export default BottomNavigator;
