import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScheduleHeader from '../components/schedule/ScheduleHeader';

const MyInscription: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScheduleHeader title="Mis Inscripciones" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <Text style={styles.placeholderText}>Aquí se mostrarán tus inscripciones próximamente.</Text>
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
  placeholderText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default MyInscription; 