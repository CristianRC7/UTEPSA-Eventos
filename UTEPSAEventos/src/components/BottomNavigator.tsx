import type React from "react"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import { View, StyleSheet } from "react-native"
import HomeScreen from "../pages/HomeScreen"
import PublicationScreen from "../pages/PublicationScreen"
import Profile from "../pages/Profile"

const Tab = createBottomTabNavigator()

interface BottomNavigatorProps {
  route: any
  navigation: any
}

const COLORS = {
  active: "#cf152d",
  inactive: "#999",
  white: "#fff",
  border: "#cf152d",
}

const ICONS: Record<string, string> = {
  Inicio: "home-variant",
  Publicaciones: "newspaper-variant-outline",
  Perfil: "account-circle-outline",
}

const BottomNavigator: React.FC<BottomNavigatorProps> = ({ route, navigation: _navigation }) => {
  const { userData } = route.params || {}

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color: _color, size: _size }) => {
          const iconName = ICONS[route.name] || "circle-outline"
          return (
            <View style={styles.iconContainer}>
              {focused && <View style={styles.activeLine} />}
              <Icon name={iconName} size={26} color={focused ? COLORS.active : COLORS.inactive} />
            </View>
          )
        },
        tabBarActiveTintColor: COLORS.active,
        tabBarInactiveTintColor: COLORS.inactive,
        tabBarStyle: {
          paddingVertical: 5,
          height: 65,
          backgroundColor: COLORS.white,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          paddingBottom: 5,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} initialParams={{ userData }} />
      <Tab.Screen name="Publicaciones" component={PublicationScreen} />
      <Tab.Screen name="Perfil" component={Profile} initialParams={{ userData }} />
    </Tab.Navigator>
  )
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  activeLine: {
    width: 28,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.active,
    marginBottom: 2,
  },
})

export default BottomNavigator;