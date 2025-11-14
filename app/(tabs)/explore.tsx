import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { Fonts } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, StyleSheet, TouchableOpacity, View } from 'react-native';
import { OPENWEATHER_API_KEY as API_KEY } from "../config/apiKey.example";
import { WeatherContext } from '../context/WeatherContext';


const weatherGradients: Record<string, [string, string]> = {
  Clear: ['#A1C4FD', '#C2E9FB'],        // bright blue gradient
  Rain: ['#89CFF0', '#5DADE2'],         // soft blue gradient
  Clouds: ['#B0C4DE', '#778899'],       // gray-blue gradient
  Snow: ['#E0F7FA', '#B0E0E6'],         // icy light blue gradient
  Thunderstorm: ['#4B6CB7', '#182848'], // stormy blue gradient
  Default: ['#A9CCE3', '#5D6D7E'],      // cool gray-blue gradient
};

const popularCities = [
  { name: 'Lagos', country: 'NG' },
  { name: 'New York', country: 'US' },
  { name: 'London', country: 'UK' },
  { name: 'Tokyo', country: 'JP' },
  { name: 'Dubai', country: 'AE' },
  { name: 'Paris', country: 'FR' },
];


const HEADER_HEIGHT = 230; 

export default function ExploreScreen() {
  const { weather: contextWeather, loading, errorMsg } = useContext(WeatherContext);
  const [iconAnim] = useState(new Animated.Value(0));
  const [cityWeather, setCityWeather] = useState<{ [key: string]: any }>({});
  const [selectedWeather, setSelectedWeather] = useState<any>(contextWeather);

  const weatherMain = selectedWeather?.weather?.[0]?.main ?? 'Clear';
  const gradientColors = weatherGradients[weatherMain] || weatherGradients.Default;

  const scrollY = useRef(new Animated.Value(0)).current;

  // Floating animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(iconAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Fetch popular cities weather
  useEffect(() => {
    popularCities.forEach(async (city) => {
      try {
        const res = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${city.name}&units=metric&appid=${API_KEY}`
        );
        setCityWeather((prev) => ({ ...prev, [city.name]: res.data }));
      } catch {}
    });
  }, []);

  const weatherDetails = {
    humidity: selectedWeather?.main?.humidity ?? 'N/A',
    windSpeed: selectedWeather?.wind?.speed ? (selectedWeather.wind.speed * 3.6).toFixed(1) : 'N/A',
    feelsLike: selectedWeather?.main?.feels_like ?? 'N/A',
    sunrise: selectedWeather?.sys?.sunrise
      ? new Date(selectedWeather.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      : 'N/A',
    sunset: selectedWeather?.sys?.sunset
      ? new Date(selectedWeather.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      : 'N/A',
  };

  const tips = weatherMain === 'Rain'
    ? ['☔ Carry an umbrella', '🛣 Avoid slippery roads']
    : weatherMain === 'Clear'
      ? ['😎 Wear sunscreen', '💧 Stay hydrated']
      : weatherMain === 'Clouds'
        ? ['☁️ Great for outdoor walks', '👕 Light clothing recommended']
        : weatherMain === 'Snow'
          ? ['🧣 Dress warmly', '❄️ Be careful on icy roads']
          : ['🌤 Have a wonderful day!'];

  const getWeatherIcon = (main: string) => {
    switch (main) {
      case 'Clear': return 'weather-sunny';
      case 'Clouds': return 'weather-cloudy';
      case 'Rain': return 'weather-rainy';
      case 'Thunderstorm': return 'weather-lightning';
      case 'Snow': return 'weather-snowy';
      case 'Drizzle': return 'weather-partly-rainy';
      case 'Mist':
      case 'Fog': return 'weather-fog';
      default: return 'weather-sunny';
    }
  };

  const handleCityPress = (cityName: string) => {
    const cityData = cityWeather[cityName];
    if (cityData) setSelectedWeather(cityData);
  };

  const renderCityCard = ({ item }: { item: { name: string; country: string } }) => {
    const cityData = cityWeather[item.name];
    const cityTemp = cityData?.main?.temp;
    const cityMain = cityData?.weather?.[0]?.main;

    return (
      <TouchableOpacity style={{ flex: 1 }} onPress={() => handleCityPress(item.name)}>
        <View style={styles.cityCard}>
          <LinearGradient
            colors={['rgba(200,200,200,0.7)', 'rgba(200,200,200,0.4)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cityCardInner}
          >
            <ThemedText style={styles.cityCardText}>{item.name}</ThemedText>
            {cityTemp && cityMain && (
              <View style={styles.cityTempRow}>
                <MaterialCommunityIcons name={getWeatherIcon(cityMain)} size={22} color="#3A7BD5" />
                <ThemedText style={styles.cityTempText}>{Math.round(cityTemp)}°C</ThemedText>
              </View>
            )}
          </LinearGradient>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) return (
    <LinearGradient colors={gradientColors} style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#fff" />
      <ThemedText style={styles.loadingText}>Loading weather data...</ThemedText>
    </LinearGradient>
  );

  if (errorMsg || !selectedWeather) return (
    <LinearGradient colors={gradientColors} style={styles.loadingContainer}>
      <ThemedText style={styles.errorText}>{errorMsg || 'No weather data available'}</ThemedText>
    </LinearGradient>
  );

  const headerTranslate = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT / 2],
    extrapolate: 'clamp',
  });

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={gradientColors} style={StyleSheet.absoluteFillObject} />

      <Animated.FlatList
        data={popularCities}
        numColumns={2}
        keyExtractor={(item) => item.name}
        renderItem={renderCityCard}
        columnWrapperStyle={styles.cityRow}
        contentContainerStyle={[styles.cityGrid, { paddingTop: HEADER_HEIGHT + 20 }]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        ListHeaderComponent={
          <Animated.View
            style={{
              height: HEADER_HEIGHT,
              justifyContent: 'center',
              alignItems: 'center',
              transform: [{ translateY: headerTranslate }],
            }}
          >
            <MaterialCommunityIcons
              name={getWeatherIcon(weatherMain)}
              size={HEADER_HEIGHT}
              color="#fff"
              style={{ opacity: 0.9 }}
            />
            <ThemedView style={styles.titleContainer}>
              <ThemedText type="title" style={styles.title}>Explore</ThemedText>
            </ThemedView>
          </Animated.View>
        }
      />

      {/* Weather Details */}
      <View style={styles.sectionContainer}>
        <Collapsible title="Humidity">
          <ThemedText>Humidity: {weatherDetails.humidity}%</ThemedText>
        </Collapsible>
        <Divider />
        <Collapsible title="Wind Speed">
          <ThemedText>Wind: {weatherDetails.windSpeed} km/h</ThemedText>
        </Collapsible>
        <Divider />
        <Collapsible title="Feels Like">
          <ThemedText>Feels like: {weatherDetails.feelsLike}°C</ThemedText>
        </Collapsible>
        <Divider />
        <Collapsible title="Sunrise & Sunset">
          <ThemedText>Sunrise: {weatherDetails.sunrise}</ThemedText>
          <ThemedText>Sunset: {weatherDetails.sunset}</ThemedText>
        </Collapsible>
        <Divider />
        <Collapsible title="Tips">
          {tips.map((tip, index) => <ThemedText key={index}>{tip}</ThemedText>)}
        </Collapsible>
      </View>
    </View>
  );
}

const Divider = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
  titleContainer: {
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: 'rgba(200, 220, 240, 0.35)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  title: { fontFamily: Fonts.rounded, fontSize: 28, color: '#1B1B1B' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#fff', marginTop: 10 },
  errorText: { color: 'red', fontWeight: 'bold' },
  sectionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  divider: { height: 1, backgroundColor: 'rgba(200,200,200,0.3)', marginVertical: 10 },
  cityGrid: { paddingHorizontal: 12, paddingBottom: 25 },
  cityRow: { justifyContent: 'space-between', marginBottom: 12 },
  cityCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  cityCardInner: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(200,200,200,0.4)',
  },
  cityCardText: { color: '#3A7BD5', fontWeight: '700', fontSize: 15 },
  cityTempRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  cityTempText: { color: '#3A7BD5', marginLeft: 6, fontSize: 14 },
});
