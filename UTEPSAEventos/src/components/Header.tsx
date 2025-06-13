import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface HeaderProps {
  title: string;
  onBack: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onBack }) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Icon name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.placeholder} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#cf152d',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  placeholder: {
    width: 24,
  },
});

export default Header;
