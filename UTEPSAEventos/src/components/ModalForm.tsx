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
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
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
              <Icon name={showPassword ? 'visibility' : 'visibility-off'} size={22} color="#888" />
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
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    marginBottom: 18,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 18,
    backgroundColor: '#F7F7F7',
    color: '#222',
    paddingRight: 40,
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    position: 'relative',
  },
  iconButton: {
    position: 'absolute',
    right: 10,
    padding: 4,
    zIndex: 2,
  },
  submitButton: {
    backgroundColor: '#111',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 40,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#111',
    shadowColor: '#111',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
    backgroundColor: '#F2F2F2',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 15,
    fontWeight: '500',
  },
});

export default ModalForm;
