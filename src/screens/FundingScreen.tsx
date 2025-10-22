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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface FundingScreenProps {
  username: string;
  onTopUp: () => void;
  onSkip: () => void;
}

const BALANCE_KEY = "@wallet_balance";

export default function FundingScreen({
  username,
  onTopUp,
  onSkip,
}: FundingScreenProps) {
  const [balance, setBalance] = React.useState<string>("00.00");
  // Slider state
  const KNOB = 64;
  const PADDING = 10;
  const translateX = React.useRef(new Animated.Value(0)).current;
  const startXRef = React.useRef(0);
  const lastXRef = React.useRef(0); // track latest value during move
  const maxXRef = React.useRef(1); // use ref instead of state to avoid stale closures

  // Handler to run on full slide
  const onSlideComplete = React.useCallback(() => {
    onTopUp && onTopUp();
  }, [onTopUp]);

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
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          startXRef.current = lastXRef.current;
        },
        onPanResponderMove: (_, g) => {
          const maxX = maxXRef.current;
          const nx = Math.max(0, Math.min(startXRef.current + g.dx, maxX));
          lastXRef.current = nx;
          translateX.setValue(nx);
        },
        onPanResponderRelease: () => {
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
    [translateX, onSlideComplete]
  );

  React.useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(BALANCE_KEY);
        if (stored !== null) {
          const num = Number(stored);
          const formatted = isNaN(num)
            ? "00.00"
            : num.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              });
          setBalance(formatted);
        }
      } catch (e) {
        // ignore and keep default
      }
    };
    load();
  }, []);

  // label fade as knob slides
  const labelOpacity = React.useMemo(
    () =>
      translateX.interpolate({
        inputRange: [0, Math.max(1, maxXRef.current)],
        outputRange: [1, 0.15],
        extrapolate: "clamp",
      }),
    [translateX]
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.page}>
        {/* Header (top) */}
        <View style={styles.headerWrap}>
          <Text style={styles.headerTitle}>Your Omnichain</Text>
          <View style={styles.titleRow}>
            <View style={styles.sticker}>
              <Text style={styles.stickerText}>💼</Text>
            </View>
            <Text style={styles.headerTitle}>Wallet</Text>
          </View>
        </View>

        {/* Middle (wallet card) */}
        <View style={styles.middleWrap}>
          <CircularDottedBackdrop size={360} step={16} />
          <View style={styles.walletCardShadow}>
            <View style={styles.walletCard}>
              <View style={styles.innerCard}>
                <Text style={styles.innerLabel}>TOKENS</Text>
                <Text style={styles.balanceText}>{balance}</Text>
              </View>

              <View style={styles.userRow}>
                <View style={styles.avatar} />
                <Text style={styles.usernameText}>
                  {username || "NEWNICKNAME_02"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom (CTA + skip) */}
        <View style={styles.bottomWrap}>
          <View
            style={styles.sliderTrack}
            onLayout={onTrackLayout}
            {...panResponder.panHandlers}
          >
            <Animated.Text style={[styles.ctaLabel, { opacity: labelOpacity }]}>
              TOP UP WALLET
            </Animated.Text>
            <Animated.View
              style={[styles.ctaKnob, { transform: [{ translateX }] }]}
              pointerEvents="none"
            >
              <Text style={styles.arrow}>→</Text>
            </Animated.View>
          </View>

          <TouchableOpacity onPress={onSkip} style={styles.skipBtn}>
            <Text style={styles.skipText}>DO THIS LATER</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Circular dotted background using absolute dots placed within a circle
function CircularDottedBackdrop({
  size = 360,
  step = 16,
}: {
  size?: number;
  step?: number;
}) {
  const radius = size / 2;
  const dots: React.ReactNode[] = [];
  for (let y = -radius; y <= radius; y += step) {
    for (let x = -radius; x <= radius; x += step) {
      if (x * x + y * y <= radius * radius) {
        const left = radius + x - 3;
        const top = radius + y - 3;
        dots.push(
          <View
            key={`d-${left}-${top}`}
            style={[styles.circleDot, { left, top }]}
          />
        );
      }
    }
  }
  return (
    <View style={styles.circleContainer} pointerEvents="none">
      <View
        style={[
          styles.circleWrap,
          { width: size, height: size, borderRadius: radius },
        ]}
      >
        {dots}
      </View>
    </View>
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
    justifyContent: "space-between",
  },
  headerWrap: {
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
  middleWrap: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    minHeight: 420,
  },
  circleContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.12,
  },
  circleWrap: {
    position: "relative",
  },
  circleDot: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#0F0F0F",
  },
  walletCardShadow: {
    width: "100%",
    paddingHorizontal: 6,
    marginTop: 18,
  },
  walletCard: {
    backgroundColor: "#161616",
    borderRadius: 28,
    padding: 18,
  },
  innerCard: {
    height: 130,
    borderRadius: 18,
    backgroundColor: "#1D2B1F",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    padding: 16,
    justifyContent: "space-between",
  },
  innerLabel: {
    color: "#98A2B3",
    fontSize: 12,
    fontFamily: "SFProDisplay-Semibold",
    letterSpacing: 1,
  },
  balanceText: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "800",
    fontFamily: "SFProDisplay-Heavy",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#0F0F0F",
    borderWidth: 2,
    borderColor: "#2E2E2E",
    marginRight: 10,
  },
  usernameText: {
    color: "#9CA3AF",
    fontFamily: "SFProDisplay-Medium",
    letterSpacing: 1,
  },
  sliderTrack: {
    width: "100%",
    marginTop: 28,
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
    fontFamily: "SFProDisplay-Bold",
    letterSpacing: 1.6,
  },
  bottomWrap: {
    alignItems: "center",
  },
  skipBtn: {
    marginTop: 16,
  },
  skipText: {
    color: "#9CA3AF",
    fontFamily: "SFProDisplay-Medium",
    letterSpacing: 1.2,
    textAlign: "center",
  },
});