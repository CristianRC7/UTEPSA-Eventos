import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PublicationScreen = () => {
  return (
    <View style={styles.centerContainer}>
      <Text style={styles.developmentText}>Publicaciones</Text>
      <Text style={styles.developmentSubtext}>Esta sección está en desarrollo. xd</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  developmentText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  developmentSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default PublicationScreen;