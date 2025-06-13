import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
//import ScheduleHeader from '../components/schedule/ScheduleHeader';
import Header from '../components/Header';
import { getSession } from '../utils/sessionStorage';
import { BASE_URL } from '../utils/Config';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LoadingPulseCardAnimation from '../components/LoadingPulseCardAnimation';

type RouteParams = {
  id_evento: number;
};

const MyInscription: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { id_evento } = (route.params as RouteParams) || {};
  const [inscripciones, setInscripciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  // Recargar al volver a la pantalla
  useFocusEffect(
    React.useCallback(() => {
      const fetchInscripciones = async () => {
        setLoading(true);
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
    }, [id_evento])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    const session = await getSession();
    if (!session?.id_usuario || !id_evento) {
      setRefreshing(false);
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
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#cf152d" />
      <Header title="Mis Inscripciones" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        {loading ? (
          <LoadingPulseCardAnimation />
        ) : (
          <FlatList
            data={inscripciones}
            keyExtractor={(item) => item.id_inscripcion_actividad.toString()}
            renderItem={({ item }) => {
              const now = new Date();
              const habilitacionInicio = item.habilitacion_inicio ? new Date(item.habilitacion_inicio) : null;
              const habilitacionFin = item.habilitacion_fin ? new Date(item.habilitacion_fin) : null;
              const respondido = !!item.respondido;
              let encuestaStatus = null;
              if (habilitacionInicio && now < habilitacionInicio) {
                encuestaStatus = (
                  <Text style={styles.encuestaInfo}>
                    El formulario se habilitará el {habilitacionInicio.toLocaleString()}
                  </Text>
                );
              } else if (habilitacionInicio && habilitacionFin && now >= habilitacionInicio && now <= habilitacionFin) {
                if (!respondido) {
                  encuestaStatus = (
                    <View style={styles.encuestaBtnContainer}>
                      <Text style={styles.encuestaInfo}>Encuesta disponible</Text>
                      <View style={styles.encuestaBtnRow}>
                        <TouchableOpacity
                          style={styles.encuestaBtn}
                          onPress={() => navigation.navigate('EventSurvey', {
                            id_actividad: item.id_actividad,
                            titulo: item.titulo
                          })}
                        >
                          <Icon name="assignment" size={20} color="#fff" style={{ marginRight: 8 }} />
                          <Text style={styles.encuestaBtnText}>Responder encuesta</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                } else {
                  encuestaStatus = (
                    <Text style={styles.encuestaRespondida}>Ya respondiste la encuesta</Text>
                  );
                }
              } else if (respondido) {
                encuestaStatus = (
                  <Text style={styles.encuestaRespondida}>Ya respondiste la encuesta</Text>
                );
              }
              return (
                <View style={styles.item}>
                  <Text style={styles.title}>{item.titulo}</Text>
                  <Text>{item.descripcion}</Text>
                  <Text>Fecha: {item.fecha} {item.hora}</Text>
                  <Text>Ubicación: {item.ubicacion}</Text>
                  <Text>Evento: {item.evento}</Text>
                  {encuestaStatus}
                </View>
              );
            }}
            ListEmptyComponent={
              <Text style={styles.placeholderText}>No tienes inscripciones.</Text>
            }
            refreshing={refreshing}
            onRefresh={handleRefresh}
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
  encuestaInfo: {
    color: '#222',
    marginTop: 8,
    fontSize: 15,
    fontWeight: '500',
  },
  encuestaBtnContainer: {
    marginTop: 12,
    alignItems: 'flex-start',
  },
  encuestaBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  encuestaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#cf152d',
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 24,
    marginTop: 6,
  },
  encuestaBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  encuestaRespondida: {
    color: '#28a745',
    marginTop: 8,
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default MyInscription;