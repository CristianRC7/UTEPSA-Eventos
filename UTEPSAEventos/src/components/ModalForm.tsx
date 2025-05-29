import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface ModalFormProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  loading?: boolean;
  placeholder?: string;
  submitLabel?: string;
}

const ModalForm: React.FC<ModalFormProps> = ({
  visible,
  onClose,
  title,
  value,
  onChangeText,
  onSubmit,
  loading = false,
  placeholder = '',
  submitLabel = 'Cambiar',
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose} disabled={loading}>
            <Icon name="close" size={24} color="#cf152d" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{title}</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={placeholder}
              secureTextEntry={!showPassword}
              value={value}
              onChangeText={onChangeText}
              placeholderTextColor="#aaa"
            />
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setShowPassword((prev) => !prev)}
            >
              <Icon name={showPassword ? 'visibility' : 'visibility-off'} size={22} color="#cf152d" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={onSubmit}
            disabled={!value.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>{submitLabel}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#cf152d',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 10,
    backgroundColor: '#f6f7fb',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#cf152d',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#cf152d',
    marginBottom: 28,
    marginTop: 10,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
    backgroundColor: '#F7F7F7',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#cf152d',
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#222',
    backgroundColor: 'transparent',
    borderRadius: 10,
  },
  iconButton: {
    position: 'absolute',
    right: 10,
    padding: 4,
    zIndex: 2,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#cf152d',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 40,
    alignItems: 'center',
    width: '100%',
    borderWidth: 0,
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ModalForm;
