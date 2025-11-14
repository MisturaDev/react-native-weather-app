import React, { useContext, useEffect, useRef } from "react";
import { Animated, FlatList, Image, StyleSheet, Text, View, } from "react-native";
import { WeatherContext } from "../app/context/WeatherContext";

export default function ForecastList() {
  const { weather, loading } = useContext(WeatherContext);
  const forecast = weather?.forecast || [];

  // Animation for fade-in effect
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (forecast.length > 0) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }
  }, [forecast]);

  if (loading || forecast.length === 0) return null;

  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>5-Day Forecast</Text>
      <Animated.View style={{ opacity: fadeAnim }}>
        <FlatList
          data={forecast}
          horizontal
          keyExtractor={(item) => item.dt.toString()}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => {
            const icon = item.weather[0].icon;
            const day = getDayName(item.dt_txt);
            return (
              <View style={styles.card}>
                <Text style={styles.day}>{day}</Text>
                <Image
                  source={{
                    uri: `https://openweathermap.org/img/wn/${icon}@2x.png`,
                  }}
                  style={styles.icon}
                />
                <Text style={styles.temp}>
                  {Math.round(item.main.temp_max)}° /{" "}
                  {Math.round(item.main.temp_min)}°
                </Text>
                <Text style={styles.desc}>{item.weather[0].main}</Text>
              </View>
            );
          }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 20, paddingHorizontal: 16 },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#fff",
    textAlign: "center",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    width: 100,
    marginRight: 12,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  day: { fontSize: 16, fontWeight: "500", marginBottom: 4, color: "#fff" },
  icon: { width: 50, height: 50 },
  temp: { fontSize: 15, fontWeight: "600", marginTop: 6, color: "#fff" },
  desc: {
    fontSize: 13,
    color: "#eee",
    marginTop: 2,
    textTransform: "capitalize",
  },
});
