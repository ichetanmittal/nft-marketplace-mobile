import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
  LayoutChangeEvent,
  ScrollView,
} from "react-native";

interface ArtCategory {
  id: string;
  name: string;
  workCount: number;
  position: { top?: number; bottom?: number; left?: number; right?: number };
}

interface ArtSelectionScreenProps {
  onComplete: (selectedCategories: string[]) => void;
  onBack?: () => void;
}

const ART_CATEGORIES_ROW_1: ArtCategory[] = [
  {
    id: "gen-art",
    name: "Gen Art",
    workCount: 210,
    position: {},
  },
  {
    id: "classical",
    name: "Classical",
    workCount: 180,
    position: {},
  },
  {
    id: "photography",
    name: "Photography",
    workCount: 150,
    position: {},
  },
];

const ART_CATEGORIES_ROW_2: ArtCategory[] = [
  {
    id: "abstract",
    name: "Abstract",
    workCount: 340,
    position: {},
  },
  {
    id: "gifs",
    name: "GIFs",
    workCount: 210,
    position: {},
  },
  {
    id: "digital",
    name: "Digital",
    workCount: 210,
    position: {},
  },
];

export default function ArtSelectionScreen({
  onComplete,
  onBack,
}: ArtSelectionScreenProps) {
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>(
    []
  );

  // Auto-scroll animations for rows
  const scrollAnim1 = React.useRef(new Animated.Value(0)).current;
  const scrollAnim2 = React.useRef(new Animated.Value(0)).current;
  const scrollRef1 = React.useRef<ScrollView>(null);
  const scrollRef2 = React.useRef<ScrollView>(null);

  // Track if user is manually scrolling
  const isUserScrolling1 = React.useRef(false);
  const isUserScrolling2 = React.useRef(false);
  const scrollTimeout1 = React.useRef<NodeJS.Timeout | null>(null);
  const scrollTimeout2 = React.useRef<NodeJS.Timeout | null>(null);

  // Track scroll widths for each row
  const scrollWidth1 = React.useRef(0);
  const scrollWidth2 = React.useRef(0);

  // Slider state
  const KNOB = 64;
  const PADDING = 10;
  const translateX = React.useRef(new Animated.Value(0)).current;
  const startXRef = React.useRef(0);
  const lastXRef = React.useRef(0);
  const maxXRef = React.useRef(1);

  // Auto-scroll effect
  React.useEffect(() => {
    const duration = 20000; // 20 seconds for full scroll

    // Row 1 - scrolls left to right
    const anim1 = Animated.loop(
      Animated.sequence([
        Animated.timing(scrollAnim1, {
          toValue: 1,
          duration: duration,
          useNativeDriver: false,
        }),
        Animated.timing(scrollAnim1, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ])
    );

    // Row 2 - scrolls right to left (starts at end)
    const anim2 = Animated.loop(
      Animated.sequence([
        Animated.timing(scrollAnim2, {
          toValue: 1,
          duration: duration,
          useNativeDriver: false,
        }),
        Animated.timing(scrollAnim2, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ])
    );

    anim1.start();
    anim2.start();

    // Listen to scroll animations and update ScrollView
    const listener1 = scrollAnim1.addListener(({ value }) => {
      if (!isUserScrolling1.current && scrollWidth1.current > 0) {
        scrollRef1.current?.scrollTo({
          x: value * scrollWidth1.current,
          animated: false,
        });
      }
    });
    const listener2 = scrollAnim2.addListener(({ value }) => {
      if (!isUserScrolling2.current && scrollWidth2.current > 0) {
        // Scroll from right to left (reverse direction)
        const scrollPosition =
          scrollWidth2.current - value * scrollWidth2.current;
        scrollRef2.current?.scrollTo({ x: scrollPosition, animated: false });
      }
    });

    return () => {
      anim1.stop();
      anim2.stop();
      scrollAnim1.removeListener(listener1);
      scrollAnim2.removeListener(listener2);

      // Clear any pending timeouts
      if (scrollTimeout1.current) {
        clearTimeout(scrollTimeout1.current);
      }
      if (scrollTimeout2.current) {
        clearTimeout(scrollTimeout2.current);
      }
    };
  }, []);

  const isEnabled = selectedCategories.length > 0;

  const onSlideComplete = React.useCallback(() => {
    console.log("[ArtSelectionScreen] Slide completed -> Starting exploration");
    onComplete(selectedCategories);
  }, [onComplete, selectedCategories]);

  const onTrackLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    const max = Math.max(1, w - PADDING * 2 - KNOB);
    maxXRef.current = max;
  };

  const snapTo = (to: number, cb?: () => void) => {
    Animated.spring(translateX, {
      toValue: to,
      useNativeDriver: true,
      bounciness: 10,
      speed: 15,
    }).start(() => cb && cb());
  };

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => isEnabled,
        onMoveShouldSetPanResponder: () => isEnabled,
        onPanResponderGrant: () => {
          startXRef.current = lastXRef.current;
        },
        onPanResponderMove: (_, g) => {
          if (!isEnabled) return;
          const maxX = maxXRef.current;
          const nx = Math.max(0, Math.min(startXRef.current + g.dx, maxX));
          lastXRef.current = nx;
          translateX.setValue(nx);
        },
        onPanResponderRelease: () => {
          if (!isEnabled) return;
          const current = lastXRef.current;
          const maxX = maxXRef.current;
          const threshold = Math.max(24, maxX * 0.65);
          if (current >= threshold) {
            lastXRef.current = maxX;
            snapTo(maxX, onSlideComplete);
          } else {
            lastXRef.current = 0;
            snapTo(0);
          }
        },
        onPanResponderTerminate: () => {
          lastXRef.current = 0;
          snapTo(0);
        },
      }),
    [translateX, onSlideComplete, isEnabled]
  );

  const labelOpacity = React.useMemo(
    () =>
      translateX.interpolate({
        inputRange: [0, Math.max(1, maxXRef.current)],
        outputRange: [1, 0.15],
        extrapolate: "clamp",
      }),
    [translateX]
  );

  const toggleCategory = (categoryId: string) => {
    // Remove the duplicate suffix if present (e.g., "gen-art-0" -> "gen-art")
    const baseId = categoryId.split("-").slice(0, -1).join("-") || categoryId;
    const cleanId = /^\d+$/.test(categoryId.split("-").slice(-1)[0])
      ? baseId
      : categoryId;

    setSelectedCategories((prev) => {
      if (prev.includes(cleanId)) {
        return prev.filter((id) => id !== cleanId);
      } else {
        return [...prev, cleanId];
      }
    });
  };

  const renderCategoryCard = (category: ArtCategory) => {
    // Check selection based on base ID (without duplicate suffix)
    const baseId = category.id.split("-").slice(0, -1).join("-") || category.id;
    const cleanId = /^\d+$/.test(category.id.split("-").slice(-1)[0])
      ? baseId
      : category.id;
    const isSelected = selectedCategories.includes(cleanId);

    return (
      <TouchableOpacity
        key={category.id}
        style={[
          styles.categoryCard,
          category.position,
          isSelected && styles.categoryCardSelected,
        ]}
        onPress={() => toggleCategory(category.id)}
        activeOpacity={0.8}
      >
        <View style={styles.categoryImagePlaceholder}>
          {/* Placeholder for circular image */}
          <View style={styles.categoryImageCircle} />
        </View>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryName}>{category.name}</Text>
          <Text style={styles.categoryCount}>{category.workCount} WORKS</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.page}>
        {/* Header */}
        <View style={styles.headerWrap}>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>Choose Art</Text>
            <View style={styles.titleRow}>
              <View style={styles.sticker}>
                <Text style={styles.stickerText}>🎨</Text>
              </View>
              <Text style={styles.headerTitle}>You Like</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>Help Us Personalise Your Feed</Text>
        </View>

        {/* Scrolling Category Rows */}
        <View style={styles.cardsContainer}>
          {/* Row 1 - Auto-scrolls Left to Right */}
          <ScrollView
            ref={scrollRef1}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.scrollRow}
            contentContainerStyle={styles.scrollRowContent}
            scrollEnabled={true}
            onScrollBeginDrag={() => {
              isUserScrolling1.current = true;
              if (scrollTimeout1.current) {
                clearTimeout(scrollTimeout1.current);
              }
            }}
            onScrollEndDrag={() => {
              // Resume auto-scroll after 1 second
              scrollTimeout1.current = setTimeout(() => {
                isUserScrolling1.current = false;
              }, 1000);
            }}
            onContentSizeChange={(width) => {
              // Store half the content width for looping
              scrollWidth1.current = width / 2;
            }}
          >
            {/* Duplicate items for seamless loop */}
            {[...ART_CATEGORIES_ROW_1, ...ART_CATEGORIES_ROW_1].map(
              (category, idx) =>
                renderCategoryCard({ ...category, id: `${category.id}-${idx}` })
            )}
          </ScrollView>

          {/* Row 2 - Auto-scrolls Right to Left (opposite) */}
          <ScrollView
            ref={scrollRef2}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.scrollRow}
            contentContainerStyle={styles.scrollRowContent}
            scrollEnabled={true}
            onScrollBeginDrag={() => {
              isUserScrolling2.current = true;
              if (scrollTimeout2.current) {
                clearTimeout(scrollTimeout2.current);
              }
            }}
            onScrollEndDrag={() => {
              // Resume auto-scroll after 1 second
              scrollTimeout2.current = setTimeout(() => {
                isUserScrolling2.current = false;
              }, 1000);
            }}
            onContentSizeChange={(width) => {
              // Store half the content width for looping
              scrollWidth2.current = width / 2;
            }}
          >
            {/* Duplicate items for seamless loop */}
            {[...ART_CATEGORIES_ROW_2, ...ART_CATEGORIES_ROW_2].map(
              (category, idx) =>
                renderCategoryCard({ ...category, id: `${category.id}-${idx}` })
            )}
          </ScrollView>
        </View>

        {/* Bottom Slider */}
        <View style={styles.bottomWrap}>
          <View
            style={[
              styles.sliderTrack,
              !isEnabled && styles.sliderTrackDisabled,
            ]}
            onLayout={onTrackLayout}
            {...(isEnabled ? panResponder.panHandlers : {})}
          >
            <Animated.Text
              style={[
                styles.ctaLabel,
                { opacity: isEnabled ? labelOpacity : 0.5 },
              ]}
            >
              START EXPLORING
            </Animated.Text>
            <Animated.View
              style={[
                styles.ctaKnob,
                !isEnabled && styles.ctaKnobDisabled,
                { transform: [{ translateX }] },
              ]}
              pointerEvents="none"
            >
              <Text style={styles.arrow}>→</Text>
            </Animated.View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  page: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },
  headerWrap: {
    alignItems: "center",
    marginBottom: 24,
  },
  titleContainer: {
    alignItems: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    fontFamily: "SFProDisplay-Heavy",
    color: "#0F0F0F",
    textAlign: "center",
  },
  sticker: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#B7FF3C",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
    marginTop: 2,
    shadowColor: "#B7FF3C",
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  stickerText: {
    fontSize: 14,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
    fontFamily: "SFProDisplay-Regular",
  },
  cardsContainer: {
    flex: 1,
    justifyContent: "center",
    marginVertical: 32,
  },
  scrollRow: {
    marginVertical: 12,
  },
  scrollRowContent: {
    paddingHorizontal: 12,
    gap: 16,
  },
  scrollRowReverse: {
    flexDirection: "row-reverse",
  },
  categoryCard: {
    width: 170,
    height: 240,
    borderRadius: 28,
    backgroundColor: "#F9FAFB",
    borderWidth: 3,
    borderColor: "transparent",
    padding: 12,
    justifyContent: "space-between",
    overflow: "hidden",
    marginHorizontal: 8,
  },
  categoryCardSelected: {
    borderColor: "#B7FF3C",
    backgroundColor: "#F9FEFB",
  },
  categoryImagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryImageCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#E5E7EB",
  },
  categoryInfo: {
    paddingVertical: 8,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F0F0F",
    marginBottom: 4,
    fontFamily: "SFProDisplay-Bold",
  },
  categoryCount: {
    fontSize: 12,
    color: "#9CA3AF",
    fontFamily: "SFProDisplay-Medium",
    letterSpacing: 0.8,
  },
  bottomWrap: {
    alignItems: "center",
  },
  sliderTrack: {
    width: "100%",
    height: 70,
    borderRadius: 20,
    backgroundColor: "#111111",
    paddingHorizontal: 10,
    paddingVertical: 8,
    overflow: "hidden",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#0F0F0F",
  },
  sliderTrackDisabled: {
    backgroundColor: "#9CA3AF",
    borderColor: "#9CA3AF",
  },
  ctaKnob: {
    position: "absolute",
    left: 10,
    top: 4,
    bottom: 5,
    width: 58,
    height: 60,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#0F0F0F",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  ctaKnobDisabled: {
    backgroundColor: "#E5E7EB",
    borderColor: "#9CA3AF",
  },
  arrow: {
    fontSize: 22,
    color: "#111111",
    fontWeight: "900",
    bottom: 5,
  },
  ctaLabel: {
    textAlign: "center",
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1.6,
    fontFamily: "SFProDisplay-Bold",
  },
});
