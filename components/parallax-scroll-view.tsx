import React, { useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

type ParallaxScrollViewProps = {
  headerImage: React.ReactElement;
  headerBackgroundColor: { light: string; dark: string };
  children?: React.ReactNode;
  headerHeight?: number;
};

export default function ParallaxScrollView({
  headerImage,
  headerBackgroundColor,
  children,
  headerHeight = 200, 
}: ParallaxScrollViewProps) {
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerTranslate = scrollY.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [0, -headerHeight / 2], 
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      {/* Parallax Header */}
      <Animated.View
        style={[
          styles.header,
          { backgroundColor: headerBackgroundColor.light, height: headerHeight },
          { transform: [{ translateY: headerTranslate }] },
        ]}
      >
        {headerImage}
      </Animated.View>

      {/* Scrollable Content */}
      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: headerHeight }}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        <View style={styles.content}>{children}</View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { position: 'absolute', width: '100%', top: 0, left: 0, zIndex: 1 },
  content: { flex: 1, padding: 10 },
});
