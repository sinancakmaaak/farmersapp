import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { PageHeader } from './PageHeader';

interface WeatherForecast {
  date: string;
  temp_min: number;
  temp_max: number;
  temp_current: number;
  weathercode: number;
  precipitation_probability: number;
  humidity: number;
  windspeed: number;
}

// Türkiye'nin büyük şehirleri ve koordinatları
const cities = {
  Istanbul: { lat: 41.0082, lon: 28.9784, name: "İstanbul" },
  Ankara: { lat: 39.9334, lon: 32.8597, name: "Ankara" },
  Izmir: { lat: 38.4237, lon: 27.1428, name: "İzmir" },
  Bursa: { lat: 40.1885, lon: 29.0610, name: "Bursa" },
  Antalya: { lat: 36.8969, lon: 30.7133, name: "Antalya" },
  Adana: { lat: 37.0000, lon: 35.3213, name: "Adana" },
  Gaziantep: { lat: 37.0662, lon: 37.3833, name: "Gaziantep" },
  Konya: { lat: 37.8667, lon: 32.4833, name: "Konya" },
  Mersin: { lat: 36.8000, lon: 34.6333, name: "Mersin" },
  Diyarbakir: { lat: 37.9144, lon: 40.2306, name: "Diyarbakır" }
};

const getWeatherIcon = (code: number): string => {
  // WMO Weather interpretation codes (WW)
  if (code === 0 || code === 1) {
    return '☀️'; // Clear sky
  } else if (code >= 2 && code <= 3) {
    return '⛅'; // Partly cloudy
  } else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return '🌧️'; // Rain
  } else if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    return '🌨️'; // Snow
  } else if (code >= 95 && code <= 99) {
    return '⛈️'; // Thunderstorm
  } else {
    return '🌫️'; // Fog
  }
};

const Weather: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<string>("Istanbul");
  const [forecast, setForecast] = useState<WeatherForecast[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWeatherData(selectedCity);
  }, [selectedCity]);

  const fetchWeatherData = async (cityKey: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const city = cities[cityKey as keyof typeof cities];
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&hourly=temperature_2m,relativehumidity_2m,weathercode,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`
      );

      if (!response.ok) {
        throw new Error('Hava durumu verisi alınamadı');
      }

      const data = await response.json();
      console.log('API Response:', data);

      // Process the data into our format
      const processedData: WeatherForecast[] = data.daily.time.map((date: string, index: number) => {
        // Get the current hour's data for the first day
        const hourlyIndex = index === 0 ? new Date().getHours() : 12; // Use noon for future days
        const hourlyArrayIndex = index * 24 + hourlyIndex;

        return {
          date: date,
          temp_min: data.daily.temperature_2m_min[index],
          temp_max: data.daily.temperature_2m_max[index],
          temp_current: data.hourly.temperature_2m[hourlyArrayIndex],
          weathercode: data.daily.weathercode[index],
          precipitation_probability: data.daily.precipitation_probability_max[index],
          humidity: data.hourly.relativehumidity_2m[hourlyArrayIndex],
          windspeed: data.hourly.windspeed_10m[hourlyArrayIndex]
        };
      });

      setForecast(processedData);
    } catch (err: any) {
      console.error('Error fetching weather data:', err);
      setError(err.message || 'Hava durumu bilgileri alınırken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Hava Durumu"
        description="7 günlük hava durumu tahmini"
      />

      <div className="mb-6">
        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
          Şehir Seçin
        </label>
        <select
          id="city"
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
        >
          {Object.entries(cities).map(([key, city]) => (
            <option key={key} value={key}>
              {city.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      ) : forecast.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {forecast.map((day, index) => (
            <div
              key={day.date}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
              <div className="p-4">
                <div className="text-center mb-4">
                  <p className="text-lg font-semibold">
                    {format(new Date(day.date), 'EEEE', { locale: tr })}
                  </p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(day.date), 'd MMMM yyyy', { locale: tr })}
                  </p>
                </div>
                
                <div className="flex justify-center mb-4">
                  <span className="text-6xl">
                    {getWeatherIcon(day.weathercode)}
                  </span>
                </div>

                <div className="text-center mb-4">
                  <p className="text-3xl font-bold text-gray-900">
                    {index === 0
                      ? `${Math.round(day.temp_current)}°C`
                      : `${Math.round(day.temp_max)}°C`}
                  </p>
                  <p className="text-sm text-gray-500">
                    {`${Math.round(day.temp_min)}°C / ${Math.round(day.temp_max)}°C`}
                  </p>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Yağış Olasılığı:</span>
                    <span>{`${Math.round(day.precipitation_probability)}%`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Nem:</span>
                    <span>{`${Math.round(day.humidity)}%`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rüzgar:</span>
                    <span>{`${Math.round(day.windspeed)} km/s`}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default Weather; 