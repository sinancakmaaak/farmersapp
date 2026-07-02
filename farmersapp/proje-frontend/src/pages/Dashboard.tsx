import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BiotechOutlined } from '@mui/icons-material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import api from '../api';

// These imports will be needed when backend is ready
// import { getAllPlantings } from '../services/plantingService';
// import { getAllTasks } from '../services/taskService';
// import { getFinancialSummary } from '../services/financialService';

interface WeatherInfo {
  temperature: number;
  humidity: number;
  windSpeed: number;
}

interface Task {
  id: number;
  title: string;
  priority: string;
  dueDate: string;
}

interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState<WeatherInfo>({
    temperature: 0,
    humidity: 0,
    windSpeed: 0
  });
  const [activePlantings, setActivePlantings] = useState(0);
  const [highPriorityTask, setHighPriorityTask] = useState<Task | null>(null);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    netIncome: 0
  });

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Fetch weather data for Istanbul (default)
    fetchWeatherData();
    fetchDashboardData();

    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch active plantings
      const plantingsResponse = await api.get('/api/plantings');
      console.log('Plantings API Response:', plantingsResponse.data);
      
      // Backend paginated response yapısını kontrol et
      let totalPlantings = 0;
      if (plantingsResponse.data) {
        if (plantingsResponse.data.content && Array.isArray(plantingsResponse.data.content)) {
          // Paginated response
          totalPlantings = plantingsResponse.data.content.length;
          console.log('Paginated plantings count:', totalPlantings);
        } else if (Array.isArray(plantingsResponse.data)) {
          // Direct array response
          totalPlantings = plantingsResponse.data.length;
          console.log('Direct array plantings count:', totalPlantings);
        }
        setActivePlantings(totalPlantings);
        console.log('Setting active plantings to:', totalPlantings);
      }

      // Fetch high priority tasks
      const tasksResponse = await api.get('/api/tasks');
      if (Array.isArray(tasksResponse.data)) {
        const highPriorityTasks = tasksResponse.data.filter(
          (task: any) => 
            task.priority === 'YUKSEK' && 
            task.status !== 'TAMAMLANDI' &&
            task.status !== 'IPTAL_EDILDI'
        );
        
        if (highPriorityTasks.length > 0) {
          // En yakın tarihli yüksek öncelikli görevi seç
          const sortedTasks = highPriorityTasks.sort((a: any, b: any) => {
            const dateA = new Date(a.dueDate).getTime();
            const dateB = new Date(b.dueDate).getTime();
            return dateA - dateB;
          });
          
          setHighPriorityTask(sortedTasks[0]);
        } else {
          setHighPriorityTask(null);
        }
      }

      // Fetch financial data
      const [expensesResponse, revenuesResponse, employeesResponse] = await Promise.all([
        api.get('/api/expenses'),
        api.get('/api/revenues'),
        api.get('/api/employees')
      ]);

      // Calculate total salary expenses
      const totalSalaryExpense = Array.isArray(employeesResponse.data) 
        ? employeesResponse.data.reduce((total: number, employee: any) => total + (employee.salary || 0), 0)
        : 0;
      
      // Calculate other expenses
      const totalOtherExpenses = Array.isArray(expensesResponse.data)
        ? expensesResponse.data.reduce((total: number, expense: any) => total + (expense.amount || 0), 0)
        : 0;
      
      // Calculate total income
      const totalIncome = Array.isArray(revenuesResponse.data)
        ? revenuesResponse.data.reduce((total: number, revenue: any) => total + (revenue.amount || 0), 0)
        : 0;
      
      // Calculate total expenses and net income
      const totalExpenses = totalSalaryExpense + totalOtherExpenses;
      const netIncome = totalIncome - totalExpenses;

      setFinancialSummary({
        totalIncome,
        totalExpenses,
        netIncome
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Hata durumunda varsayılan değerleri göster
      setActivePlantings(0);
      setHighPriorityTask(null);
      setFinancialSummary({
        totalIncome: 0,
        totalExpenses: 0,
        netIncome: 0
      });
    }
  };

  const fetchWeatherData = async () => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=41.0082&longitude=28.9784&current=temperature_2m,relativehumidity_2m,windspeed_10m`
      );
      const data = await response.json();
      
      setWeather({
        temperature: Math.round(data.current.temperature_2m),
        humidity: Math.round(data.current.relativehumidity_2m),
        windSpeed: Math.round(data.current.windspeed_10m)
      });
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  const menuItems = [
    {
      title: 'Tarlalar',
      description: 'Tarla yönetimi ve bilgileri',
      icon: '🌾',
      path: '/fields',
    },
    {
      title: 'Seralar',
      description: 'Sera yönetimi ve bilgileri',
      icon: '🏗️',
      path: '/greenhouses',
    },
    {
      title: 'Ürünler',
      description: 'Ürün yönetimi ve bilgileri',
      icon: '🌱',
      path: '/products',
    },
    {
      title: 'Ekim/Dikim',
      description: 'Ekim ve dikim kayıtları',
      icon: '🌿',
      path: '/plantings',
    },
    {
      title: 'Gübreleme',
      description: 'Gübreleme kayıtları ve takibi',
      icon: '💩',
      path: '/fertilizations',
    },
    {
      title: 'Sulama',
      description: 'Sulama kayıtları ve takibi',
      icon: '💧',
      path: '/irrigation',
    },
    {
      title: 'Hasat',
      description: 'Hasat kayıtları ve takibi',
      icon: '🌾',
      path: '/harvests',
    },
    {
      title: 'Envanter',
      description: 'Stok ve envanter yönetimi',
      icon: '📦',
      path: '/inventory',
    },
    {
      title: 'Tedarikçiler',
      description: 'Tedarikçi yönetimi',
      icon: '🤝',
      path: '/suppliers',
    },
    {
      title: 'İlaçlama',
      description: 'İlaçlama kayıtları ve takibi',
      icon: '🧪',
      path: '/pesticides',
    },
    {
      title: 'Toprak Testleri',
      description: 'Toprak analiz sonuçları',
      icon: '🔬',
      path: '/soil-tests',
    },
    {
      title: 'Mali Analiz',
      description: 'Finansal raporlar ve analizler',
      icon: '📊',
      path: '/financial-analysis',
    },
    {
      title: 'Çalışanlar',
      description: 'Personel yönetimi',
      icon: '👥',
      path: '/employees',
    },
    {
      title: 'Görevler',
      description: 'Görev yönetimi',
      icon: '📝',
      path: '/tasks',
    },
    {
      title: 'Araçlar',
      description: 'Araç takibi',
      icon: '🚜',
      path: '/vehicles',
    },
    {
      title: 'Belgeler',
      description: 'Belge yönetimi',
      icon: '📄',
      path: '/documents',
    },
    {
      title: 'Fotoğraflar',
      description: 'Fotoğraf galerisi',
      icon: '📸',
      path: '/photos',
    },
    {
      title: 'Hava Durumu',
      description: 'Hava durumu tahminleri',
      icon: '🌤️',
      path: '/weather',
    },
    {
      title: 'Döviz Kurları',
      description: 'Güncel döviz kurları',
      icon: '💱',
      path: '/exchange-rates',
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Weather and Time Information */}
      <div className="mb-8 bg-white rounded-lg shadow-md p-4">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-semibold text-gray-800">
            {format(currentTime, 'HH:mm', { locale: tr })}
          </div>
          <div className="text-2xl text-gray-800">
            {format(currentTime, 'd MMMM yyyy, EEEE', { locale: tr })}
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-2xl">
              <span className="text-3xl">🌡️</span> {weather.temperature}°C
            </div>
            <div className="text-2xl text-gray-800">
              <span className="text-3xl">💧</span> {weather.humidity}%
            </div>
            <div className="text-2xl text-gray-800">
              <span className="text-3xl">💨</span> {weather.windSpeed} km/s
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {menuItems.map((item, index) => (
          <div
            key={index}
            onClick={() => navigate(item.path)}
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center mb-4">
              <span className="text-4xl mr-4">{item.icon}</span>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Statistics */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Hızlı İstatistikler</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Financial Summary */}
          <div className="bg-white rounded-lg shadow-md p-6 min-h-[200px]">
            <div className="flex items-center mb-4">
              <div className="text-4xl mr-4">💰</div>
              <div>
                <h3 className="text-lg font-medium text-gray-600">Finansal Durum</h3>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Gelir:</span>
                <span className="text-green-600 font-medium">
                  {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(financialSummary.totalIncome)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Gider:</span>
                <span className="text-red-600 font-medium">
                  {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(financialSummary.totalExpenses)}
                </span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Net Kazanç:</span>
                  <span className={`text-xl font-semibold ${financialSummary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(financialSummary.netIncome)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Plantings */}
          <div className="bg-white rounded-lg shadow-md p-6 min-h-[200px]">
            <div className="flex items-center mb-4">
              <div className="text-4xl mr-4">🌱</div>
              <div>
                <h3 className="text-lg font-medium text-gray-600">Aktif Ekimler</h3>
                <p className="text-2xl font-semibold text-blue-600">{activePlantings}</p>
              </div>
            </div>
          </div>

          {/* High Priority Task */}
          <div className="bg-white rounded-lg shadow-md p-6 min-h-[200px]">
            <div className="flex items-center mb-4">
              <div className="text-4xl mr-4">⚠️</div>
              <div>
                <h3 className="text-lg font-medium text-gray-600">Yüksek Öncelikli Görev</h3>
              </div>
            </div>
            <div>
              {highPriorityTask ? (
                <div>
                  <p className="text-lg font-semibold text-red-600">{highPriorityTask.title}</p>
                  <p className="text-sm text-gray-500">Son Tarih: {format(new Date(highPriorityTask.dueDate), 'd MMMM yyyy', { locale: tr })}</p>
                </div>
              ) : (
                <p className="text-lg text-gray-500">Yüksek öncelikli görev yok</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
