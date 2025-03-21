import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const EmptyState: React.FC = () => {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Icon name="people" size={50} color="#FFFFFF" />
      </View>
      <Text style={styles.emptyText}>No hay expositores registrados</Text>
      <Text style={styles.emptySubtext}>
        No se han registrado expositores para este evento.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    paddingVertical: 60,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    maxWidth: 300,
  },
});

export default EmptyState;
