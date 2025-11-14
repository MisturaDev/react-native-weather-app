import axios from "axios";
import * as Location from "expo-location";
import React, { createContext, ReactNode, useEffect, useState } from "react";
import { OPENWEATHER_API_KEY as API_KEY } from "../config/apiKey.example";



interface WeatherContextProps {
  weather: any;
  loading: boolean;
  errorMsg: string | null;
  lastUpdated: Date | null;
  fetchWeather: (cityName?: string) => Promise<void>;
}

export const WeatherContext = createContext<WeatherContextProps>({
  weather: null,
  loading: true,
  errorMsg: null,
  lastUpdated: null,
  fetchWeather: async () => {},
});

export const WeatherProvider = ({ children }: { children: ReactNode }) => {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastCity, setLastCity] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchWeather = async (cityName?: string) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      let response, forecastResponse;

      if (!cityName) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Permission to access location was denied");
          setLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
        );

        forecastResponse = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
        );

        setLastCity(null);
      } else {
        response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${API_KEY}`
        );

        forecastResponse = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=metric&appid=${API_KEY}`
        );

        setLastCity(cityName);
      }

      const dailyForecast = forecastResponse.data.list.filter((item: any) =>
        item.dt_txt.includes("12:00:00")
      );

      setWeather({
        ...response.data,
        forecast: dailyForecast,
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.log("Weather fetch error:", error);
      setErrorMsg("Failed to fetch weather data. Please check the city name.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();

    const interval = setInterval(() => {
      fetchWeather(lastCity || undefined);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <WeatherContext.Provider value={{ weather, loading, errorMsg, lastUpdated, fetchWeather }}>
      {children}
    </WeatherContext.Provider>
  );
};
