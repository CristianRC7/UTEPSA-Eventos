import { useState, useEffect } from "react"
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
  PermissionsAndroid,
  Linking,
} from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import { useNavigation } from "@react-navigation/native"
import ImagePicker from "react-native-image-crop-picker"
import { getSession } from "../utils/sessionStorage"
import { BASE_URL } from "../utils/Config"
import BottomSheet from "./BottomSheet"

const MAX_IMAGES = 5;
const MAX_DESCRIPTION_LENGTH = 250;

const FormPublication = () => {
  const navigation = useNavigation()
  const [selectedImages, setSelectedImages] = useState<any[]>([])
  const [caption, setCaption] = useState("")
  const [eventName, setEventName] = useState("")
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showEventSelector, setShowEventSelector] = useState(false)
  const [eventList, setEventList] = useState<any[]>([])
  const [eventLoading, setEventLoading] = useState(false);

  useEffect(() => {
    if (showEventSelector) {
      fetchEvents()
    }
  }, [showEventSelector])

  const fetchEvents = async () => {
    setEventLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/Events.php`)
      const data = await response.json()
      if (data.success) {
        setEventList(data.events)
      } else {
        setEventList([])
      }
    } catch (error) {
      setEventList([])
    }
    setEventLoading(false);
  }

  // Solicitar permiso para galería en Android
  const requestGalleryPermission = async () => {
    if (Platform.OS === "android") {
      try {
        let granted = null;
        if (Platform.Version >= 33) {
          // Android 13+
          granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            {
              title: "Permiso para acceder a la galería",
              message: "Necesitamos acceso a tu galería para que puedas seleccionar fotos.",
              buttonNeutral: "Preguntar después",
              buttonNegative: "Cancelar",
              buttonPositive: "Aceptar",
            }
          );
        } else {
          // Android 12 o menor
          granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            {
              title: "Permiso para acceder a la galería",
              message: "Necesitamos acceso a tu galería para que puedas seleccionar fotos.",
              buttonNeutral: "Preguntar después",
              buttonNegative: "Cancelar",
              buttonPositive: "Aceptar",
            }
          );
        }
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        } else if (
          granted === PermissionsAndroid.RESULTS.DENIED ||
          granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
        ) {
          Alert.alert(
            "Permiso denegado",
            "No podemos acceder a tu galería. Por favor, habilita el permiso en la configuración.",
            [
              { text: "Cancelar", style: "cancel" },
              { text: "Ir a ajustes", onPress: () => Linking.openSettings() }
            ]
          );
        }
        return false;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS maneja permisos diferente
  };

  // Solicitar permiso para cámara en Android
  const requestCameraPermission = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Permiso para usar la cámara",
            message: "Necesitamos acceso a tu cámara para tomar fotos.",
            buttonNeutral: "Preguntar después",
            buttonNegative: "Cancelar",
            buttonPositive: "Aceptar",
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        } else if (
          granted === PermissionsAndroid.RESULTS.DENIED ||
          granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
        ) {
          Alert.alert(
            "Permiso denegado",
            "No podemos acceder a tu cámara. Por favor, habilita el permiso en la configuración.",
            [
              { text: "Cancelar", style: "cancel" },
              { text: "Ir a ajustes", onPress: () => Linking.openSettings() }
            ]
          );
        }
        return false;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS maneja permisos diferente
  };

  // Seleccionar imágenes de la galería
  const selectFromGallery = async () => {
    if (selectedImages.length >= MAX_IMAGES) {
      Alert.alert("Límite alcanzado", `Solo puedes seleccionar hasta ${MAX_IMAGES} imágenes.`);
      return;
    }

    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) {
      return;
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
      if ((error as any).toString().includes("cancel")) {
        // User cancelled the operation
      } else {
        console.log("Error selecting images:", error)
        Alert.alert("Error", "No se pudieron seleccionar las imágenes")
      }
    }
  }

  // Tomar una foto usando la cámara
  const takePhoto = async () => {
    if (selectedImages.length >= MAX_IMAGES) {
      Alert.alert("Límite alcanzado", `Solo puedes seleccionar hasta ${MAX_IMAGES} imágenes.`);
      return;
    }

    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      return;
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
      if ((error as any).toString().includes("cancel")) {
        // User cancelled the operation
      } else {
        console.log("Error taking photo:", error)
        Alert.alert("Error", "No se pudo tomar la foto")
      }
    }
  }

  // Remove an image from the selected images
  const removeImage = (index: number) => {
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
  const handleSubmit = async () => {
    if (selectedImages.length < 2) {
      Alert.alert("Error", "Por favor selecciona al menos dos imágenes");
      return;
    }
    if (!selectedEventId) {
      Alert.alert("Error", "Por favor selecciona un evento");
      return;
    }
    setIsLoading(true);
    try {
      const userData = await getSession();
      if (!userData || !userData.id_usuario) {
        Alert.alert('Error', 'No se pudo obtener el usuario.');
        setIsLoading(false);
        return;
      }
      const formData = new FormData()
      formData.append('id_usuario', userData.id_usuario)
      formData.append('id_evento', selectedEventId)
      formData.append('descripcion', caption)
      selectedImages.forEach((img, idx) => {
        formData.append('imagenes[]', {
          uri: img.path,
          type: img.mime || 'image/jpeg',
          name: img.filename || `imagen_${idx}.jpg`
        })
      })
      const response = await fetch(`${BASE_URL}/CreatePublication.php`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      const data = await response.json()
      if (data.success) {
        Alert.alert("Publicación enviada", data.message || "Tu publicación ha sido enviada y está en proceso de revisión.", [{ text: "OK", onPress: () => navigation.goBack() }])
      } else {
        Alert.alert("Error", data.message || "No se pudo enviar la publicación")
      }
    } catch (error) {
      Alert.alert("Error", "Ocurrió un error al enviar la publicación")
    }
    setIsLoading(false)
  }

  const handleGoBack = () => {
    navigation.goBack()
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Icon name="arrow-back" size={24} color="#fff" />
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

            <Text style={styles.requirementText}>
              Debes seleccionar al menos 2 imágenes para poder publicar.
            </Text>
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
              onChangeText={text => {
                if (text.length <= MAX_DESCRIPTION_LENGTH) setCaption(text);
              }}
              placeholder="Escribe una descripción..."
              placeholderTextColor="#999"
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={MAX_DESCRIPTION_LENGTH + 1}
            />
            <Text style={{ alignSelf: 'flex-end', color: caption.length > MAX_DESCRIPTION_LENGTH ? 'red' : '#999', fontSize: 12 }}>
              {caption.length}/{MAX_DESCRIPTION_LENGTH}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (selectedImages.length < 2 || !eventName.trim() || isLoading || caption.length > MAX_DESCRIPTION_LENGTH) && styles.disabledButton,
          ]}
          onPress={handleSubmit}
          disabled={selectedImages.length < 2 || !eventName.trim() || isLoading || caption.length > MAX_DESCRIPTION_LENGTH}
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
      <BottomSheet
        visible={showEventSelector}
        onClose={() => setShowEventSelector(false)}
        title="Selecciona un evento"
        height={400}
        loading={eventLoading}
      >
        <FlatList
          data={eventList}
          keyExtractor={(item) => item.id_evento.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterOption,
                selectedEventId === item.id_evento && styles.selectedFilterOption
              ]}
              onPress={() => handleSelectEvent(item.id_evento, item.titulo)}
            >
              <Icon
                name="event"
                size={20}
                color={selectedEventId === item.id_evento ? "#FFF" : "#111"}
                style={styles.eventIcon}
              />
              <Text style={[
                styles.filterText,
                selectedEventId === item.id_evento && styles.selectedFilterText
              ]}>
                {item.titulo}
              </Text>
              {selectedEventId === item.id_evento && <Icon name="check" size={20} color="#FFF" style={styles.checkIcon} />}
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.eventsList}
        />
      </BottomSheet>
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
    backgroundColor: "#cf152d",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
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
    backgroundColor: "#cf152d",
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
  eventsList: {
    padding: 16,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedFilterOption: {
    backgroundColor: '#cf152d',
  },
  filterText: {
    fontSize: 16,
    color: '#111',
    marginLeft: 12,
  },
  selectedFilterText: {
    color: '#FFF',
    fontWeight: '500',
  },
  eventIcon: {
    marginRight: 12,
  },
  checkIcon: {
    marginLeft: 8,
  },
  requirementText: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
    marginBottom: 0,
    textAlign: 'left',
    paddingLeft: 4,
  },
})

export default FormPublication;