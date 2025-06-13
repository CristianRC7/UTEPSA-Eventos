import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';

const Information: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#cf152d" />
      <Header title="Información" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <Image
          source={require('../images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.description}>
          UTEPSA Eventos es una aplicación móvil diseñada para gestionar y participar en eventos académicos de la Universidad Tecnológica Privada de Santa Cruz de la Sierra.
        </Text>
        <View style={styles.footer}>
          <Text style={styles.copyright}>© Derechos reservados UTEPSA 2025</Text>
          <Text style={styles.cdrc}>cdrc</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 32,
  },
  description: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    alignItems: 'center',
  },
  copyright: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  cdrc: {
    fontSize: 12,
    color: '#666',
  },
});

export default Information;
