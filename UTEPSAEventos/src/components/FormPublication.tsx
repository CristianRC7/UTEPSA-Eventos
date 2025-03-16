import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ScrollView,
  TextInput,
  Platform,
  Alert,
  ActivityIndicator,
  FlatList,
  Modal,
} from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import { useNavigation } from "@react-navigation/native"
import ImagePicker from "react-native-image-crop-picker"
import { PermissionsAndroid } from "react-native"

const MAX_IMAGES = 5;

// Eventos de ejemplo - estos vendrían del backend en una implementación real
const EVENTOS_EJEMPLO = [
  { id: 1, nombre: "Concierto Benéfico 2023" },
  { id: 2, nombre: "Maratón por la Educación" },
  { id: 3, nombre: "Festival de Arte Urbano" },
  { id: 4, nombre: "Feria Gastronómica Local" },
  { id: 5, nombre: "Torneo Deportivo Comunitario" },
]

const FormPublication = () => {
  const navigation = useNavigation()
  const [selectedImages, setSelectedImages] = useState<any[]>([])
  const [caption, setCaption] = useState("")
  const [eventName, setEventName] = useState("")
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showEventSelector, setShowEventSelector] = useState(false)

  // Request permission for accessing gallery on Android
  const requestGalleryPermission = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES, {
          title: "Permiso para acceder a la galería",
          message: "Necesitamos acceso a tu galería para que puedas seleccionar fotos.",
          buttonNeutral: "Preguntar después",
          buttonNegative: "Cancelar",
          buttonPositive: "Aceptar",
        })
        return granted === PermissionsAndroid.RESULTS.GRANTED
      } catch (err) {
        console.warn(err)
        return false
      }
    }
    return true // iOS will handle permissions differently
  }

  // Select images from gallery
  const selectFromGallery = async () => {
    if (selectedImages.length >= MAX_IMAGES) {
      Alert.alert("Límite alcanzado", `Solo puedes seleccionar hasta ${MAX_IMAGES} imágenes.`)
      return
    }

    const hasPermission = await requestGalleryPermission()
    if (!hasPermission) {
      Alert.alert(
        "Permiso denegado",
        "No podemos acceder a tu galería. Por favor, habilita el permiso en la configuración.",
        [{ text: "Entendido" }],
      )
      return
    }

    try {
      const images = await ImagePicker.openPicker({
        width: 1200,
        height: 1200,
        cropping: true,
        cropperCancelText: "Cancelar",
        cropperChooseText: "Elegir",
        compressImageQuality: 0.8,
        multiple: true,
        maxFiles: MAX_IMAGES - selectedImages.length,
      })

      // Make sure we don't exceed the maximum number of images
      const newImages = Array.isArray(images) ? images : [images]
      const totalImages = [...selectedImages, ...newImages]

      if (totalImages.length > MAX_IMAGES) {
        const allowedNewImages = newImages.slice(0, MAX_IMAGES - selectedImages.length)
        setSelectedImages([...selectedImages, ...allowedNewImages])
        Alert.alert(
          "Límite alcanzado",
          `Solo se han añadido ${allowedNewImages.length} imágenes para no superar el límite de ${MAX_IMAGES}.`,
        )
      } else {
        setSelectedImages(totalImages)
      }
    } catch (error) {
      if (error.toString().includes("cancel")) {
        // User cancelled the operation
      } else {
        console.log("Error selecting images:", error)
        Alert.alert("Error", "No se pudieron seleccionar las imágenes")
      }
    }
  }

  // Take a photo using camera
  const takePhoto = async () => {
    if (selectedImages.length >= MAX_IMAGES) {
      Alert.alert("Límite alcanzado", `Solo puedes seleccionar hasta ${MAX_IMAGES} imágenes.`)
      return
    }

    try {
      const image = await ImagePicker.openCamera({
        width: 1200,
        height: 1200,
        cropping: true,
        cropperCancelText: "Cancelar",
        cropperChooseText: "Elegir",
        compressImageQuality: 0.8,
      })
      setSelectedImages([...selectedImages, image])
    } catch (error) {
      if (error.toString().includes("cancel")) {
        // User cancelled the operation
      } else {
        console.log("Error taking photo:", error)
        Alert.alert("Error", "No se pudo tomar la foto")
      }
    }
  }

  // Remove an image from the selected images
  const removeImage = (index) => {
    const updatedImages = [...selectedImages]
    updatedImages.splice(index, 1)
    setSelectedImages(updatedImages)
  }

  // Handle event selection
  const handleSelectEvent = (id: number, nombre: string) => {
    setSelectedEventId(id)
    setEventName(nombre)
    setShowEventSelector(false)
  }

  // Simulate form submission
  const handleSubmit = () => {
    if (selectedImages.length === 0) {
      Alert.alert("Error", "Por favor selecciona al menos una imagen")
      return
    }

    if (!eventName.trim()) {
      Alert.alert("Error", "Por favor selecciona un evento")
      return
    }

    // Show loading state
    setIsLoading(true)

    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false)
      Alert.alert(
        "Publicación enviada",
        "Tu publicación ha sido enviada y está en proceso de revisión. ¡Gracias por compartir!",
        [{ text: "OK", onPress: () => navigation.goBack() }],
      )
    }, 2000)
  }

  const handleGoBack = () => {
    navigation.goBack()
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Publicar Fotos</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageSection}>
          <View style={styles.selectedImagesContainer}>
            {selectedImages.length > 0 && (
              <>
                <Text style={styles.imageCount}>
                  {selectedImages.length} de {MAX_IMAGES} imágenes
                </Text>
                <FlatList
                  data={selectedImages}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item, index }) => (
                    <View style={styles.imageItem}>
                      <Image source={{ uri: item.path }} style={styles.thumbnailImage} resizeMode="cover" />
                      <TouchableOpacity style={styles.removeImageButton} onPress={() => removeImage(index)}>
                        <Icon name="close" size={16} color="#FFF" />
                      </TouchableOpacity>
                    </View>
                  )}
                  keyExtractor={(item, index) => index.toString()}
                  contentContainerStyle={styles.imagesContainer}
                />
              </>
            )}

            {selectedImages.length < MAX_IMAGES && (
              <View
                style={[styles.imagePickerContainer, selectedImages.length > 0 && styles.imagePickerContainerSmall]}
              >
                <View style={styles.imagePickerRow}>
                  <TouchableOpacity
                    style={[styles.imagePickerButton, selectedImages.length > 0 && styles.imagePickerButtonSmall]}
                    onPress={selectFromGallery}
                  >
                    <Icon name="photo-library" size={selectedImages.length > 0 ? 30 : 40} color="#333" />
                    <Text style={[styles.imagePickerText, selectedImages.length > 0 && styles.imagePickerTextSmall]}>
                      Galería
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.dividerVertical}>
                    <View style={styles.dividerLineVertical} />
                  </View>

                  <TouchableOpacity
                    style={[styles.imagePickerButton, selectedImages.length > 0 && styles.imagePickerButtonSmall]}
                    onPress={takePhoto}
                  >
                    <Icon name="photo-camera" size={selectedImages.length > 0 ? 30 : 40} color="#333" />
                    <Text style={[styles.imagePickerText, selectedImages.length > 0 && styles.imagePickerTextSmall]}>
                      Cámara
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.inputLabel}>Evento</Text>
          <TouchableOpacity style={styles.selectContainer} onPress={() => setShowEventSelector(true)}>
            <Icon name="event" size={20} color="#555" style={styles.inputIcon} />
            <Text style={[styles.selectText, !eventName && styles.selectPlaceholder]}>
              {eventName || "Selecciona un evento"}
            </Text>
            <Icon name="arrow-drop-down" size={24} color="#555" />
          </TouchableOpacity>

          <Text style={styles.inputLabel}>Descripción (opcional)</Text>
          <View style={styles.textAreaContainer}>
            <TextInput
              style={styles.textArea}
              value={caption}
              onChangeText={setCaption}
              placeholder="Escribe una descripción..."
              placeholderTextColor="#999"
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (selectedImages.length === 0 || !eventName.trim() || isLoading) && styles.disabledButton,
          ]}
          onPress={handleSubmit}
          disabled={selectedImages.length === 0 || !eventName.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <>
              <Icon name="send" size={20} color="#FFF" style={styles.submitIcon} />
              <Text style={styles.submitText}>Publicar</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Modal para seleccionar evento */}
      <Modal
        visible={showEventSelector}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEventSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecciona un evento</Text>
              <TouchableOpacity onPress={() => setShowEventSelector(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={EVENTOS_EJEMPLO}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.eventItem, selectedEventId === item.id && styles.eventItemSelected]}
                  onPress={() => handleSelectEvent(item.id, item.nombre)}
                >
                  <Icon
                    name="event"
                    size={20}
                    color={selectedEventId === item.id ? "#FFF" : "#555"}
                    style={styles.eventIcon}
                  />
                  <Text style={[styles.eventText, selectedEventId === item.id && styles.eventTextSelected]}>
                    {item.nombre}
                  </Text>
                  {selectedEventId === item.id && <Icon name="check" size={20} color="#FFF" style={styles.checkIcon} />}
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.eventsList}
            />
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
    borderBottomColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  rightPlaceholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  imageSection: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  imagePickerContainer: {
    width: "100%",
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  imagePickerButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  imagePickerText: {
    marginTop: 8,
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    width: "80%",
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  dividerText: {
    paddingHorizontal: 10,
    color: "#555",
  },
  selectedImagesContainer: {
    width: "100%",
  },
  imageCount: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
    textAlign: "right",
  },
  imagesContainer: {
    flexDirection: "row",
  },
  imageItem: {
    marginRight: 10,
    position: "relative",
  },
  thumbnailImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#333",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  addMoreButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  formSection: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: "#F5F5F5",
  },
  selectContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: "#F5F5F5",
    height: 48,
  },
  selectText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  selectPlaceholder: {
    color: "#999",
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: "#333",
  },
  textAreaContainer: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#F5F5F5",
  },
  textArea: {
    fontSize: 16,
    color: "#333",
    minHeight: 100,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
  },
  submitButton: {
    backgroundColor: "#333",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  disabledButton: {
    backgroundColor: "#CCCCCC",
  },
  submitIcon: {
    marginRight: 8,
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  imagePickerContainerSmall: {
    marginTop: 16,
    padding: 12,
  },
  imagePickerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
  },
  imagePickerButtonSmall: {
    padding: 8,
  },
  imagePickerTextSmall: {
    fontSize: 14,
  },
  dividerVertical: {
    height: 50,
    alignItems: "center",
  },
  dividerLineVertical: {
    width: 1,
    height: "100%",
    backgroundColor: "#E0E0E0",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  eventsList: {
    padding: 16,
  },
  eventItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#F5F5F5",
  },
  eventItemSelected: {
    backgroundColor: "#333",
  },
  eventIcon: {
    marginRight: 12,
  },
  eventText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  eventTextSelected: {
    color: "#FFFFFF",
  },
  checkIcon: {
    marginLeft: 8,
  },
})

export default FormPublication;

