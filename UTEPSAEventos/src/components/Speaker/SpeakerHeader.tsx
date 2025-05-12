import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface SpeakerHeaderProps {
  title: string;
  onBack: () => void;
}

const SpeakerHeader: React.FC<SpeakerHeaderProps> = ({ title, onBack }) => {
  return (
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.spacer} />
      </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },
  spacer: {
    width: 40,
  },
  eventTitleContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#F9F9F9",
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
});

export default SpeakerHeader;
