import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Keyboard, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from "react-native";
import ForecastList from "../../components/ForecastList";
import { WeatherContext } from "../context/WeatherContext";


const weatherGradients: Record<string, [string, string]> = {
  Clear: ["#56CCF2", "#2F80ED"],       // clear sky / blue
  Rain: ["#00c6fb", "#005bea"],        // rain/blue
  Clouds: ["#d7d2cc", "#304352"],      // cloudy/gray-blue
  Snow: ["#e0eafc", "#cfdef3"],        // snowy/light-blue
  Thunderstorm: ["#141E30", "#243B55"], // storm/dark-blue
  Default: ["#4a90e2", "#145da0"],     // default gradient
};

const HomeScreen = () => {
  const { weather, loading, errorMsg, fetchWeather } = useContext(WeatherContext);
  const [cityName, setCityName] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const iconAnim = useRef(new Animated.Value(0)).current;

  // Determine weather type
  const weatherType = weather?.weather[0].main || "Default";
  // Get gradient for weather
  const gradientColors = weatherGradients[weatherType] || weatherGradients.Default;

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Animate weather icon up/down
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(iconAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const getWeatherIcon = (main: string) => {
    switch (main) {
      case "Clouds": return "weather-cloudy";
      case "Rain": return "weather-rainy";
      case "Clear": return "weather-sunny";
      case "Snow": return "weather-snowy";
      case "Thunderstorm": return "weather-lightning";
      default: return "weather-partly-cloudy";
    }
  };

  const handleSearch = async () => {
    if (cityName.trim() !== "") {
      await fetchWeather(cityName.trim());
      setLastUpdated(new Date());
      Keyboard.dismiss();
      setCityName("");
    }
  };

  const handleCurrentLocation = async () => {
    try {
      await fetchWeather();
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching current location weather:", error);
      alert("Unable to get location. Please try again.");
    }
  };

  // Pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchWeather(weather?.name || undefined);
    setLastUpdated(new Date());
    setRefreshing(false);
  }, [fetchWeather, weather]);

  // Initial fetch
  useEffect(() => {
    const fetchInitial = async () => {
      await fetchWeather();
      setLastUpdated(new Date());
    };
    fetchInitial();
  }, []);

  return (
    <LinearGradient
      colors={gradientColors as [string, string, ...string[]]}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.appTitle}>WeatherNow</Text>
        </View>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
          }
        >
          {loading ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : errorMsg ? (
            <Text style={styles.error}>{errorMsg}</Text>
          ) : (
            weather && (
              <>
                <Text style={styles.time}>
                  {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })} |{" "}
                  {currentTime.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()}
                </Text>

                <Text style={styles.city}>
                {weather.name}{weather.sys?.country ? `, ${weather.sys.country}` : ""}
               </Text>


                <Animated.View
                  style={{
                    transform: [
                      { translateY: iconAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) },
                    ],
                  }}
                >
                  <MaterialCommunityIcons
                    name={getWeatherIcon(weather.weather[0].main)}
                    size={80}
                    color="#fff"
                  />
                </Animated.View>

                <Text style={styles.temp}>{Math.round(weather.main.temp)}°C</Text>
                <Text style={styles.desc}>{weather.weather[0].description}</Text>

                {lastUpdated && (
                  <Text style={styles.updated}>
                    Last updated: {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </Text>
                )}

                <ForecastList />
              </>
            )
          )}

          {/* Search section */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter city name"
              placeholderTextColor="#ccc"
              value={cityName}
              onChangeText={setCityName}
            />
            <TouchableOpacity style={styles.button} onPress={handleSearch}>
              <Text style={styles.buttonText}>Search</Text>
            </TouchableOpacity>
          </View>

          {/* Current location */}
          <TouchableOpacity onPress={handleCurrentLocation}>
            <Text
              style={{
                color: "#fff",
                textAlign: "center",
                marginTop: 10,
                fontWeight: "bold",
                textDecorationLine: "underline",
              }}
            >
              Use Current Location
            </Text>
          </TouchableOpacity>

          {/* Footer */}
          <Text style={styles.footer}>Powered by OpenWeather • Built by Mistura Ishola</Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: {
    marginTop: 50,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  appTitle: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  time: { textAlign: "center", color: "#fff", fontSize: 16, marginBottom: 5 },
  city: { textAlign: "center", color: "#fff", fontSize: 28, fontWeight: "bold", marginBottom: 10 },
  temp: { textAlign: "center", color: "#fff", fontSize: 60, fontWeight: "bold" },
  desc: { textAlign: "center", color: "#eee", fontSize: 18, marginBottom: 5, textTransform: "capitalize" },
  updated: { textAlign: "center", color: "#ddd", fontSize: 12, marginBottom: 10, opacity: 0.8 },
  error: { textAlign: "center", color: "red", fontSize: 18 },
  searchContainer: { flexDirection: "row", marginTop: 20, alignSelf: "center" },
  input: { borderColor: "#fff", borderWidth: 1, padding: 10, color: "#fff", width: "70%", borderRadius: 10, marginRight: 10, },
  button: { backgroundColor: "#fff", padding: 10, borderRadius: 10, alignItems: "center" },
  buttonText: { color: "#145da0", fontWeight: "bold" },
  footer: { textAlign: "center", fontSize: 12, color: "#fff", marginTop: 20, marginBottom: 10, opacity: 0.6 },
});

export default HomeScreen;
