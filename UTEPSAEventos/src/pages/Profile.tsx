import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { clearSession, changePassword } from '../utils/sessionStorage';
import ModalForm from '../components/ModalForm';

const Profile = ({ route, navigation }: any) => {
  const userData = route.params?.userData;
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [loadingPassword, setLoadingPassword] = useState(false);

  const getFullName = () => {
    if (userData?.apellido_paterno && userData?.apellido_materno) {
      return `${userData.nombre} ${userData.apellido_paterno} ${userData.apellido_materno}`;
    } else if (userData?.apellidos) {
      return `${userData.nombre} ${userData.apellidos}`;
    }
    return userData?.nombre || 'Usuario';
  };

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Está seguro que desea cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sí',
          onPress: async () => {
            await clearSession();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.profileHeader}>
          <Text style={styles.headerTitle}>Mi Perfil</Text>
        </View>

        <View style={styles.profileInfo}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Nombre:</Text>
            <Text style={styles.infoValue}>{getFullName()}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Usuario:</Text>
            <Text style={styles.infoValue}>{userData?.usuario}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowPasswordModal(true)}
        >
          <Text style={styles.actionButtonText}>Cambiar contraseña</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('MyCertificateScreen')}
        >
          <Text style={styles.actionButtonText}>Ver mis certificados</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        {/* Modal para cambiar contraseña */}
        <ModalForm
          visible={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          title="Cambiar contraseña"
          value={newPassword}
          onChangeText={setNewPassword}
          loading={loadingPassword}
          onSubmit={async () => {
            setLoadingPassword(true);
            const res = await changePassword(userData?.id_usuario, newPassword);
            setLoadingPassword(false);
            setShowPasswordModal(false);
            setNewPassword('');
            Alert.alert(res.success ? 'Éxito' : 'Error', res.message);
          }}
          placeholder="Ingresa tu nueva contraseña"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    padding: 20,
  },
  profileHeader: {
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  profileInfo: {
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  infoItem: {
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#555',
  },
  actionButton: {
    backgroundColor: '#111',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#111',
    shadowColor: '#111',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  logoutButton: {
    backgroundColor: '#F2F2F2',
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  logoutButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default Profile;