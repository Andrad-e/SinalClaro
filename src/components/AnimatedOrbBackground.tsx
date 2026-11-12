import React, { useEffect, useMemo } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

/**
 * Fundo com três "orbs" de gradiente que flutuam lentamente em loop.
 * Dá profundidade e sensação de movimento sem pesar na renderização:
 * cada orb roda uma única Animated.loop própria, em paralelo.
 */
function Orb({
  size,
  colorsFrom,
  style,
  duration,
  distance,
}: {
  size: number;
  colorsFrom: readonly [string, string, ...string[]];
  style?: object;
  duration: number;
  distance: number;
}) {
  const translate = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(translate, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(translate, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [translate, duration]);

  const translateY = translate.interpolate({
    inputRange: [0, 1],
    outputRange: [0, distance],
  });
  const translateX = translate.interpolate({
    inputRange: [0, 1],
    outputRange: [0, distance * 0.6],
  });
  const scale = translate.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          transform: [{ translateX }, { translateY }, { scale }],
        },
        style,
      ]}
    >
      <LinearGradient
        colors={colorsFrom}
        start={{ x: 0.2, y: 0.1 }}
        end={{ x: 0.8, y: 0.9 }}
        style={{ flex: 1, borderRadius: size / 2 }}
      />
    </Animated.View>
  );
}

export function AnimatedOrbBackground() {
  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={[colors.gradientFrom, colors.gradientVia, colors.gradientTo]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Orb
        size={340}
        duration={9000}
        distance={36}
        colorsFrom={['rgba(47,107,255,0.55)', 'rgba(47,107,255,0)']}
        style={{ top: -90, left: -80, opacity: 0.9 }}
      />
      <Orb
        size={260}
        duration={11000}
        distance={-28}
        colorsFrom={['rgba(34,211,238,0.45)', 'rgba(34,211,238,0)']}
        style={{ bottom: -60, right: -60 }}
      />
      <Orb
        size={200}
        duration={7000}
        distance={22}
        colorsFrom={['rgba(251,191,36,0.22)', 'rgba(251,191,36,0)']}
        style={{ top: '38%', right: -40 }}
      />
      <View style={styles.noiseOverlay} />
    </View>
  );
}

const styles = StyleSheet.create({
  noiseOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(6, 11, 24, 0.18)',
  },
});
