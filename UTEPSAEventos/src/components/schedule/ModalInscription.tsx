import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { ScheduleActivity } from '../../types/ScheduleTypes';
import { getSession } from '../../utils/sessionStorage';
import { BASE_URL } from '../../utils/Config';

interface ModalInscriptionProps {
  visible: boolean;
  activity: ScheduleActivity | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ModalInscription: React.FC<ModalInscriptionProps> = ({ visible, activity, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  if (!activity) return null;

  const handleInscribir = async () => {
    setLoading(true);
    try {
      const userData = await getSession();
      if (!userData || !userData.id_usuario) {
        Alert.alert('Error', 'No se pudo obtener el usuario.');
        setLoading(false);
        return;
      }
      const response = await fetch(`${BASE_URL}/InscripcionActividades.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario: userData.id_usuario,
          id_actividad: activity.id_actividad
        })
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert('¡Inscripción exitosa!', data.message || 'Te has inscrito correctamente.');
        onSuccess();
      } else {
        Alert.alert('Error', data.message || 'No se pudo inscribir.');
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al inscribirse.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>¿Deseas inscribirte a la actividad?</Text>
          <Text style={styles.activityTitle}>{activity.titulo}</Text>
          <Text style={styles.activityDesc}>{activity.descripcion}</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose} disabled={loading}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={handleInscribir} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmButtonText}>Inscribirse</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#cf152d',
    textAlign: 'center',
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#222',
    textAlign: 'center',
  },
  activityDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#cf152d',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default ModalInscription; 