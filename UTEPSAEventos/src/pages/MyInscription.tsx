import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScheduleHeader from '../components/schedule/ScheduleHeader';
import { getSession } from '../utils/sessionStorage';
import { BASE_URL } from '../utils/Config';

type RouteParams = {
  id_evento: number;
};

const MyInscription: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { id_evento } = (route.params as RouteParams) || {};
  const [inscripciones, setInscripciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInscripciones = async () => {
      const session = await getSession();
      if (!session?.id_usuario || !id_evento) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`${BASE_URL}/GetUserInscriptions.php?id_usuario=${session.id_usuario}&id_evento=${id_evento}`);
        const data = await response.json();
        if (data.success) {
          setInscripciones(data.inscripciones);
        }
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };
    fetchInscripciones();
  }, [id_evento]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScheduleHeader title="Mis Inscripciones" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#000" />
        ) : inscripciones.length === 0 ? (
          <Text style={styles.placeholderText}>No tienes inscripciones.</Text>
        ) : (
          <FlatList
            data={inscripciones}
            keyExtractor={(item) => item.id_inscripcion_actividad.toString()}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <Text style={styles.title}>{item.titulo}</Text>
                <Text>{item.descripcion}</Text>
                <Text>Fecha: {item.fecha} {item.hora}</Text>
                <Text>Ubicación: {item.ubicacion}</Text>
                <Text>Evento: {item.evento}</Text>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  placeholderText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  item: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
});

export default MyInscription;