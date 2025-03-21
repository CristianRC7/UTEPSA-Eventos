"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Modal,
  ScrollView,
  Alert,
  StatusBar,
  Dimensions,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import Icon from "react-native-vector-icons/MaterialIcons"
import { BASE_URL } from "../utils/Config"

const { width } = Dimensions.get("window")
const cardWidth = (width - 48) / 2 // 2 columns with padding

interface SpeakerScreenProps {
  route: {
    params: {
      eventId: number
      eventTitle: string
    }
  }
}

interface Speaker {
  id_expositor: number
  nombre: string
  apellido_paterno: string
  apellido_materno: string
  descripcion: string
  imagen_url: string | null
}

const SpeakerScreen: React.FC<SpeakerScreenProps> = ({ route }) => {
  const navigation = useNavigation()
  const { eventId, eventTitle } = route.params
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null)
  const [modalVisible, setModalVisible] = useState(false)

  const fetchSpeakers = async () => {
    try {
      const response = await fetch(`${BASE_URL}/Speakers.php?event_id=${eventId}`)
      const data = await response.json()

      if (data.success) {
        setSpeakers(data.speakers)
      } else {
        setSpeakers([])
        if (data.message !== "No se encontraron expositores") {
          Alert.alert("Error", data.message)
        }
      }
    } catch (error) {
      console.error("Error fetching speakers:", error)
      Alert.alert("Error", "No se pudieron cargar los expositores")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchSpeakers()
  }, [eventId])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchSpeakers()
  }

  const handleBack = () => {
    navigation.goBack()
  }

  const openSpeakerDetails = (speaker: Speaker) => {
    setSelectedSpeaker(speaker)
    setModalVisible(true)
  }

  const getFullName = (speaker: Speaker) => {
    return `${speaker.nombre} ${speaker.apellido_paterno} ${speaker.apellido_materno}`
  }

  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) {
      return null
    }
    return { uri: `${BASE_URL}/upload/${imageUrl}` }
  }

  const renderSpeakerCard = ({ item }: { item: Speaker }) => {
    return (
      <TouchableOpacity style={styles.speakerCard} onPress={() => openSpeakerDetails(item)} activeOpacity={0.7}>
        <View style={styles.speakerImageContainer}>
          {item.imagen_url ? (
            <Image source={getImageUrl(item.imagen_url) || undefined} style={styles.speakerImage} resizeMode="cover" />
          ) : (
            <View style={styles.placeholderContainer}>
              <Icon name="person" size={60} color="#CCCCCC" />
            </View>
          )}
        </View>
        <View style={styles.speakerInfo}>
          <Text style={styles.speakerName} numberOfLines={2}>
            {getFullName(item)}
          </Text>
          <View style={styles.viewProfileContainer}>
            <Text style={styles.viewProfile}>Ver perfil</Text>
            <Icon name="arrow-forward" size={14} color="#10B981" style={styles.arrowIcon} />
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Icon name="people" size={50} color="#FFFFFF" />
      </View>
      <Text style={styles.emptyText}>No hay expositores registrados</Text>
      <Text style={styles.emptySubtext}>No se han registrado expositores para este evento.</Text>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expositores</Text>
        <View style={styles.spacer} />
      </View>

      {/* Event Title */}
      {eventTitle && (
        <View style={styles.eventTitleContainer}>
          <Text style={styles.eventTitle}>{eventTitle}</Text>
        </View>
      )}

      {/* Content */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Cargando expositores...</Text>
        </View>
      ) : (
        <FlatList
          data={speakers}
          renderItem={renderSpeakerCard}
          keyExtractor={(item) => item.id_expositor.toString()}
          contentContainerStyle={styles.speakerList}
          numColumns={2}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={renderEmptyList}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modal for speaker details */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>

            {selectedSpeaker && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                  {selectedSpeaker.imagen_url ? (
                    <View style={styles.modalImageContainer}>
                      <Image
                        source={getImageUrl(selectedSpeaker.imagen_url) || undefined}
                        style={styles.modalImage}
                        resizeMode="cover"
                      />
                    </View>
                  ) : (
                    <View style={styles.modalPlaceholderContainer}>
                      <Icon name="person" size={80} color="#CCCCCC" />
                    </View>
                  )}
                  <Text style={styles.modalName}>{getFullName(selectedSpeaker)}</Text>
                </View>

                <View style={styles.modalDivider} />

                <View style={styles.modalBody}>
                  <Text style={styles.modalSectionTitle}>Biografía</Text>
                  <Text style={styles.modalDescription}>{selectedSpeaker.descripcion}</Text>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
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
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  speakerList: {
    padding: 16,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  speakerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    width: cardWidth,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  speakerImageContainer: {
    height: cardWidth,
    backgroundColor: "#F5F5F5",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
  placeholderContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  speakerImage: {
    width: "100%",
    height: "100%",
  },
  speakerInfo: {
    padding: 16,
  },
  speakerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  viewProfileContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewProfile: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "500",
  },
  arrowIcon: {
    marginLeft: 4,
  },
  emptyContainer: {
    paddingVertical: 60,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    maxWidth: 300,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    width: "100%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: "hidden",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 20,
    padding: 6,
  },
  modalHeader: {
    alignItems: "center",
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  modalImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "#F3F4F6",
  },
  modalPlaceholderContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  modalImage: {
    width: "100%",
    height: "100%",
  },
  modalName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
  },
  modalDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 20,
    marginHorizontal: 24,
  },
  modalBody: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 16,
    color: "#555",
    lineHeight: 24,
    textAlign: "justify",
  },
})

export default SpeakerScreen;