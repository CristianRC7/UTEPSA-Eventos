import { useState, useRef, useEffect, useCallback } from "react";
import { 
  View, 
  FlatList, 
  Image, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  Animated, 
  type ViewToken 
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import LoadingPulse from "./LoadingPulse";
import { BASE_URL } from '../utils/Config';

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CAROUSEL_INTERVAL = 6000; // 6 segundos

interface CarouselProps {
  images: string[];
  height?: number;
  autoPlay?: boolean;
  showControls?: boolean;
  showPagination?: boolean;
  onImagePress?: (imageUrl: string, index: number) => void;
}

interface ViewableItemsChanged {
  viewableItems: ViewToken[];
  changed: ViewToken[];
}

const Carousel = ({
  images,
  height = 240,
  autoPlay = true,
  showControls = true,
  showPagination = true,
  onImagePress,
}: CarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Solo mostrar controles si hay más de una imagen
  const hasMultipleImages = images.length > 1;

  const startAutoPlay = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      if (activeIndex === images.length - 1) {
        goToSlide(0);
      } else {
        goToSlide(activeIndex + 1);
      }
    }, CAROUSEL_INTERVAL);
  }, [activeIndex, images.length]);

  useEffect(() => {
    if (autoPlay && hasMultipleImages) {
      startAutoPlay();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [activeIndex, autoPlay, hasMultipleImages, startAutoPlay]);

  const goToSlide = (index: number) => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index,
        animated: true,
      });
      setActiveIndex(index);
    }
  };

  const handleViewableItemsChanged = useRef(({ viewableItems }: ViewableItemsChanged) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const goToPrevious = () => {
    if (activeIndex === 0) {
      goToSlide(images.length - 1);
    } else {
      goToSlide(activeIndex - 1);
    }
  };

  const goToNext = () => {
    if (activeIndex === images.length - 1) {
      goToSlide(0);
    } else {
      goToSlide(activeIndex + 1);
    }
  };

  const handleImageLoad = (imageUrl: string) => {
    setImagesLoaded(prev => ({
      ...prev,
      [imageUrl]: true
    }));
  };

  const renderItem = ({ item, index }: { item: string, index: number }) => (
    <TouchableOpacity activeOpacity={0.9} onPress={() => onImagePress && onImagePress(item, index)}>
      <View style={[styles.imageContainer, { height }]}>
        {!imagesLoaded[item] && (
          <LoadingPulse width={SCREEN_WIDTH} height={height} />
        )}
        <Image 
          source={item ? { uri: `${BASE_URL}/${item}` } : undefined}
          style={[
            styles.image, 
            { height, opacity: imagesLoaded[item] ? 1 : 0 }
          ]} 
          resizeMode="cover"
          onLoad={() => handleImageLoad(item)}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={images}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => index.toString()}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
        scrollEnabled={false}
      />

      {hasMultipleImages && showControls && (
        <View style={styles.controlsContainer}>
          <TouchableOpacity style={styles.controlButton} onPress={goToPrevious}>
            <Icon name="chevron-left" size={28} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={goToNext}>
            <Icon name="chevron-right" size={28} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}

      {hasMultipleImages && showPagination && (
        <View style={styles.paginationContainer}>
          {images.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.paginationDot, index === activeIndex && styles.paginationDotActive]}
              onPress={() => goToSlide(index)}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    position: "relative",
  },
  image: {
    width: SCREEN_WIDTH,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  controlsContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  paginationContainer: {
    position: "absolute",
    bottom: 16,
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: "#FFFFFF",
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export default Carousel;
