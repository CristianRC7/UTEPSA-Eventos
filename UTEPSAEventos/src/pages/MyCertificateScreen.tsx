import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getSession } from '../utils/sessionStorage';
import { BASE_URL } from '../utils/Config';
import LoadingPulseCardAnimation from '../components/LoadingPulseCardAnimation';

interface Certificado {
  id_certificado: number;
  nro_certificado: string;
  nombre_evento: string;
  certificado_img: string | null;
}

const MyCertificateScreen = ({ navigation }: any) => {
  const [certificados, setCertificados] = useState<Certificado[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCertificados = async () => {
    const session = await getSession();
    if (!session?.id_usuario) {
      setCertificados([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/GetUserCertificates.php?id_usuario=${session.id_usuario}`);
      const data = await res.json();
      if (data.success) {
        setCertificados(data.certificados);
      } else {
        setCertificados([]);
      }
    } catch (e) {
      setCertificados([]);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    setLoading(true);
    fetchCertificados();
  }, []);

  const renderItem = ({ item }: { item: Certificado }) => (
    <TouchableOpacity
      style={styles.certCard}
      onPress={async () => {
        const session = await getSession();
        if (!session?.id_usuario) return;
        const url = `${BASE_URL}/GetUserCertificates.php?download_certificado=${item.id_certificado}&id_usuario=${session.id_usuario}`;
        // Abrir en navegador para descargar
        // @ts-ignore
        import('react-native').then(({ Linking }) => Linking.openURL(url));
      }}
    >
      <Icon name="picture-as-pdf" size={32} color="#D32F2F" style={{ marginRight: 16 }} />
      <View style={{ flex: 1 }}>
        <Text style={styles.eventName}>{item.nombre_evento}</Text>
        <Text style={styles.certNumber}>Nro: {item.nro_certificado}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Certificados</Text>
        <View style={styles.spacer} />
      </View>
      <View style={styles.content}>
        {loading ? (
          <LoadingPulseCardAnimation />
        ) : certificados.length === 0 ? (
          <View style={styles.emptyContent}>
            <Icon name="insert-drive-file" size={60} color="#bbb" style={{ marginBottom: 10 }} />
            <Text style={styles.emptyText}>No tienes certificados disponibles</Text>
          </View>
        ) : (
          <FlatList
            data={certificados}
            keyExtractor={item => item.id_certificado.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 20 }}
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchCertificados();
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  spacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    marginTop: 8,
  },
  certCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  eventName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 2,
  },
  certNumber: {
    fontSize: 13,
    color: '#555',
    marginBottom: 1,
  },
});

export default MyCertificateScreen;
