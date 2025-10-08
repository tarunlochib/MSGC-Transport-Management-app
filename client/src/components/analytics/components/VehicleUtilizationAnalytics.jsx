import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const VehicleUtilizationAnalytics = ({ data, period }) => {
  const [selectedView, setSelectedView] = useState('utilization');

  // Process vehicle utilization data
  const vehicleData = useMemo(() => {
    if (!data?.vehicles || !data?.rawBookings) return null;

    const vehicleStats = {};
    
    // Initialize vehicle stats
    data.vehicles.forEach(vehicle => {
      vehicleStats[vehicle.id] = {
        id: vehicle.id,
        vehicleNumber: vehicle.vehicleNumber,
        capacity: vehicle.capacity || 0,
        status: vehicle.status,
        fuelType: vehicle.fuelType,
        year: vehicle.year,
        totalBookings: 0,
        totalWeight: 0,
        totalRevenue: 0,
        utilizationRate: 0,
        avgWeightPerTrip: 0
      };
    });

    // Calculate stats from bookings
    data.rawBookings.forEach(booking => {
      if (booking.vehicleId && vehicleStats[booking.vehicleId]) {
        vehicleStats[booking.vehicleId].totalBookings += 1;
        vehicleStats[booking.vehicleId].totalWeight += booking.weightKg || 0;
        vehicleStats[booking.vehicleId].totalRevenue += booking.totalCharges || 0;
      }
    });

    // Calculate utilization rates and averages
    Object.values(vehicleStats).forEach(vehicle => {
      vehicle.avgWeightPerTrip = vehicle.totalBookings > 0 ? vehicle.totalWeight / vehicle.totalBookings : 0;
      vehicle.utilizationRate = vehicle.capacity > 0 ? (vehicle.totalWeight / vehicle.capacity) * 100 : 0;
    });

    return Object.values(vehicleStats).sort((a, b) => b.totalBookings - a.totalBookings);
  }, [data]);

  // Process fuel type distribution
  const fuelTypeData = useMemo(() => {
    if (!vehicleData) return null;

    const fuelStats = {};
    vehicleData.forEach(vehicle => {
      const fuelType = vehicle.fuelType || 'Unknown';
      if (!fuelStats[fuelType]) {
        fuelStats[fuelType] = { count: 0, totalWeight: 0 };
      }
      fuelStats[fuelType].count += 1;
      fuelStats[fuelType].totalWeight += vehicle.totalWeight;
    });

    return {
      labels: Object.keys(fuelStats),
      datasets: [
        {
          data: Object.values(fuelStats).map(stats => stats.count),
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(251, 191, 36, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(168, 85, 247, 0.8)'
          ],
          borderColor: [
            'rgb(59, 130, 246)',
            'rgb(34, 197, 94)',
            'rgb(251, 191, 36)',
            'rgb(239, 68, 68)',
            'rgb(168, 85, 247)'
          ],
          borderWidth: 2
        }
      ]
    };
  }, [vehicleData]);

  // Process vehicle performance data
  const performanceData = useMemo(() => {
    if (!vehicleData) return null;

    const topVehicles = vehicleData.slice(0, 8);
    return {
      labels: topVehicles.map(vehicle => vehicle.vehicleNumber),
      datasets: [
        {
          label: 'Total Bookings',
          data: topVehicles.map(vehicle => vehicle.totalBookings),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 2
        },
        {
          label: 'Total Weight (kg)',
          data: topVehicles.map(vehicle => vehicle.totalWeight),
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 2
        }
      ]
    };
  }, [vehicleData]);

  // Process vehicle status distribution
  const statusData = useMemo(() => {
    if (!vehicleData) return null;

    const statusStats = {};
    vehicleData.forEach(vehicle => {
      const status = vehicle.status || 'Unknown';
      statusStats[status] = (statusStats[status] || 0) + 1;
    });

    return {
      labels: Object.keys(statusStats),
      datasets: [
        {
          data: Object.values(statusStats),
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(251, 191, 36, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(156, 163, 175, 0.8)'
          ],
          borderColor: [
            'rgb(34, 197, 94)',
            'rgb(251, 191, 36)',
            'rgb(239, 68, 68)',
            'rgb(156, 163, 175)'
          ],
          borderWidth: 2
        }
      ]
    };
  }, [vehicleData]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            if (context.dataset.label === 'Total Weight (kg)') {
              return `Weight: ${context.parsed.y.toLocaleString()} kg`;
            }
            return `${context.dataset.label}: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    }
  };

  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <p>No vehicle data available</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Vehicle Utilization Analytics</h3>
          <p className="text-sm text-gray-500">Fleet performance and utilization metrics</p>
        </div>
      </div>

      {/* View Selector */}
      <div className="flex items-center space-x-2 mb-6">
        <button
          onClick={() => setSelectedView('utilization')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            selectedView === 'utilization'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Performance
        </button>
        <button
          onClick={() => setSelectedView('fuel')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            selectedView === 'fuel'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Fuel Types
        </button>
        <button
          onClick={() => setSelectedView('status')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            selectedView === 'status'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Status
        </button>
      </div>

      {/* Chart */}
      <div className="h-80 mb-6">
        {selectedView === 'utilization' && performanceData && (
          <Bar data={performanceData} options={chartOptions} />
        )}
        {selectedView === 'fuel' && fuelTypeData && (
          <Doughnut data={fuelTypeData} options={doughnutOptions} />
        )}
        {selectedView === 'status' && statusData && (
          <Doughnut data={statusData} options={doughnutOptions} />
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">Total Vehicles</p>
              <p className="text-2xl font-bold text-blue-900">
                {vehicleData?.length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-xl">🚛</span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">Active Vehicles</p>
              <p className="text-2xl font-bold text-green-900">
                {vehicleData?.filter(v => v.status === 'Active').length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-800">Avg Utilization</p>
              <p className="text-2xl font-bold text-purple-900">
                {vehicleData ? 
                  Math.round(vehicleData.reduce((sum, v) => sum + v.utilizationRate, 0) / vehicleData.length) : 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 text-xl">📊</span>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-800">Top Performer</p>
              <p className="text-sm font-bold text-orange-900 truncate">
                {vehicleData?.[0]?.vehicleNumber || 'N/A'}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-600 text-xl">🏆</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Vehicles Table */}
      {vehicleData && vehicleData.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Top Performing Vehicles</h4>
          <div className="space-y-2">
            {vehicleData.slice(0, 5).map((vehicle, index) => (
              <div key={vehicle.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{vehicle.vehicleNumber}</p>
                    <p className="text-xs text-gray-600">{vehicle.fuelType} • {vehicle.year}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {vehicle.totalBookings} trips
                  </p>
                  <p className="text-xs text-gray-600">
                    {Math.round(vehicle.utilizationRate)}% utilized
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default VehicleUtilizationAnalytics;
