import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { clearSession, changePassword } from '../utils/sessionStorage';
import ModalForm from '../components/ModalForm';
import Icon from 'react-native-vector-icons/MaterialIcons';

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
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Icon name="person" size={64} color="#fff" style={styles.avatarIcon} />
          </View>
          <Text style={styles.profileName}>{getFullName()}</Text>
          <Text style={styles.profileUser}>@{userData?.usuario}</Text>
        </View>

        <View style={styles.optionsList}>
          <TouchableOpacity style={styles.optionItem} onPress={() => setShowPasswordModal(true)}>
            <View style={[styles.optionIcon, styles.optionIconLock]}>
              <Icon name="lock" size={24} color="#fff" />
            </View>
            <Text style={styles.optionText}>Cambiar contraseña</Text>
            <Icon name="chevron-right" size={24} color="#bbb" style={styles.optionChevron} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem} onPress={() => navigation.navigate('MyCertificateScreen')}>
            <View style={[styles.optionIcon, styles.optionIconSchool]}>
              <Icon name="school" size={24} color="#fff" />
            </View>
            <Text style={styles.optionText}>Ver mis certificados</Text>
            <Icon name="chevron-right" size={24} color="#bbb" style={styles.optionChevron} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem} onPress={() => Alert.alert('Soporte', 'Si necesitas ayuda, contáctate con soporte en el 3er piso, bloque este o al correo soporte.campusvirtual@utepsa.edu')}>
            <View style={[styles.optionIcon, styles.optionIconHelp]}>
              <Icon name="help" size={24} color="#fff" />
            </View>
            <Text style={styles.optionText}>Soporte</Text>
            <Icon name="chevron-right" size={24} color="#bbb" style={styles.optionChevron} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
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
    backgroundColor: '#F6F7FB',
  },
  scrollContainer: {
    padding: 0,
    alignItems: 'center',
    paddingBottom: 30,
  },
  profileCard: {
    backgroundColor: '#cf152d',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    marginTop: 0,
    marginBottom: 30,
    width: '100%',
    alignSelf: 'center',
  },
  avatarContainer: {
    backgroundColor: '#fff',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarIcon: {
    color: '#cf152d',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  profileUser: {
    fontSize: 15,
    color: '#fff',
    marginBottom: 0,
    textAlign: 'center',
  },
  optionsList: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: 'transparent',
    marginBottom: 30,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 16,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionIconSchool: {
    backgroundColor: '#4F46E5',
  },
  optionIconLock: {
    backgroundColor: '#cf152d',
  },
  optionIconHelp: {
    backgroundColor: '#8B5CF6',
  },
  optionText: {
    fontSize: 16,
    color: '#222',
    fontWeight: '600',
    flex: 1,
  },
  optionChevron: {
    marginLeft: 8,
  },
  logoutButton: {
    backgroundColor: '#fff',
    height: 55,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 2,
    borderColor: '#cf152d',
    width: '90%',
    alignSelf: 'center',
  },
  logoutButtonText: {
    color: '#cf152d',
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});

export default Profile;
