import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const GodownWeightTable = ({ transporters, bookings, challans, loading }) => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [godowns, setGodowns] = useState([]);
  const [targetTransporter, setTargetTransporter] = useState(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Find the target transporter and fetch godowns
  useEffect(() => {
    const findTargetTransporter = async () => {
      if (!transporters) return;
      
      // Find transporter with GST 07AAUCS4940E1Z1
      const target = transporters.find(t => 
        t.contactInfo && t.contactInfo.includes('07AAUCS4940E1Z1')
      );
      
      if (target) {
        setTargetTransporter(target);
        try {
          const response = await axios.get(`/api/godowns/transporter/${target.id}`);
          setGodowns(response.data);
        } catch (error) {
          console.error('Error fetching godowns:', error);
        }
      }
    };

    findTargetTransporter();
  }, [transporters]);

  // Calculate remaining weight grouped by transporters
  const calculateRemainingWeight = () => {
    if (!transporters || !bookings || !challans) return [];

    // CORRECT LOGIC: Show current month data, but calculate remaining weight properly
    const [year, month] = selectedMonth.split('-').map(Number);
    
    // Filter bookings by selected month (for display)
    const monthBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.bookingDate);
      return bookingDate.getFullYear() === year && bookingDate.getMonth() === month - 1;
    });

    // Filter challans by selected month (for display)
    const monthChallans = challans.filter(challan => {
      const challanDate = new Date(challan.dateGenerated);
      return challanDate.getFullYear() === year && challanDate.getMonth() === month - 1;
    });

    const results = [];

    transporters.forEach(transporter => {
      // Get current month bookings for this transporter
      const transporterBookings = monthBookings.filter(booking => booking.transporterId === transporter.id);
      
      // Get current month challans for this transporter  
      const transporterChallans = monthChallans.filter(challan => challan.transportCompanyId === transporter.id);
      
      // Calculate current month weights (for display)
      const totalBookingWeight = transporterBookings.reduce((sum, booking) => sum + (booking.weightKg || 0), 0);
      const totalChallanWeight = transporterChallans.reduce((sum, challan) => sum + (challan.totalWeight || 0), 0);
      
      // DEBUG: Log current data
      
      // CORRECT APPROACH: Check which current month bookings are already dispatched
      // Find bookings that are included in current month challans
      const dispatchedBookings = transporterBookings.filter(booking => {
        try {
          return transporterChallans.some(challan => {
            // Validation: Ensure challan has goods and they're properly structured
            if (!challan.challanGoods || !Array.isArray(challan.challanGoods)) {
              return false;
            }
            return challan.challanGoods.some(good => {
              // Validation: Ensure good has bookingId
              if (!good || typeof good.bookingId !== 'string') {
                return false;
              }
              return good.bookingId === booking.id;
            });
          });
        } catch (error) {
          console.warn(`Error checking dispatched status for booking ${booking.id}:`, error);
          return false;
        }
      });
      
      
      // Calculate remaining weight: current month bookings - dispatched bookings
      const remainingWeight = transporterBookings
        .filter(booking => !dispatchedBookings.some(dispatched => dispatched.id === booking.id))
        .reduce((sum, booking) => sum + (booking.weightKg || 0), 0);
      
      
      
      // Calculate percentage
      const percentage = totalBookingWeight > 0 ? ((remainingWeight / totalBookingWeight) * 100) : 0;

      // Check if this is the target transporter with godowns
      const isTargetTransporter = targetTransporter && transporter.id === targetTransporter.id;
      const transporterGodowns = isTargetTransporter && godowns ? godowns : [];

      // Calculate consignments left in godown (using same logic as remaining weight)
      const consignmentsInGodown = transporterBookings.filter(booking => {
        try {
          const hasChallan = transporterChallans.some(challan => {
            if (!challan.challanGoods || !Array.isArray(challan.challanGoods)) {
              return false;
            }
            return challan.challanGoods.some(good => {
              if (!good || typeof good.bookingId !== 'string') {
                return false;
              }
              return good.bookingId === booking.id;
            });
          });
          return !hasChallan;
        } catch (error) {
          console.warn(`Error checking consignment status for booking ${booking.id}:`, error);
          return true; // Assume still in godown if error
        }
      });

      // Add transporter row
      results.push({
        id: `transporter-${transporter.id}`,
        name: transporter.name,
        type: 'transporter',
        transporterName: transporter.name,
        // Current month data only
        totalBookingWeight,
        totalChallanWeight: totalChallanWeight,
        remainingWeight,
        percentage: Math.round(percentage),
        totalBookings: transporterBookings.length,
        totalChallans: transporterChallans.length,
        consignmentsInGodown: consignmentsInGodown.length,
        hasGodowns: transporterGodowns.length > 0,
        godowns: transporterGodowns.map(godown => {
          // Get current month bookings for this godown
          const godownBookings = transporterBookings.filter(booking => booking.godownId === godown.id);
          
          // Calculate total weight from bookings for this godown
          const godownTotalBookingWeight = godownBookings.reduce((sum, booking) => sum + (booking.weightKg || 0), 0);
          
          // Get actual challan weight for this godown by checking which bookings from this godown are in challans
          let godownChallanWeight = 0;
          
          // Get all booking IDs for this godown
          const godownBookingIds = godownBookings.map(booking => booking.id);
          
          // Find challan goods that belong to bookings from this godown
          transporterChallans.forEach(challan => {
            if (challan.challanGoods && Array.isArray(challan.challanGoods)) {
              challan.challanGoods.forEach(challanGood => {
                if (challanGood && typeof challanGood.bookingId === 'string' && godownBookingIds.includes(challanGood.bookingId)) {
                  godownChallanWeight += challanGood.weight || 0;
                }
              });
            }
          });
          
          // Calculate consignments left in this godown
          const godownConsignmentsInGodown = godownBookings.filter(booking => {
            const hasChallan = transporterChallans.some(challan => {
              if (!challan.challanGoods || !Array.isArray(challan.challanGoods)) {
                return false;
              }
              return challan.challanGoods.some(good => {
                if (!good || typeof good.bookingId !== 'string') {
                  return false;
                }
                return good.bookingId === booking.id;
              });
            });
            return !hasChallan;
          });
          
          // Calculate remaining weight for this godown - no rounding to match stock calculations
          const godownRemainingWeight = Math.max(0, godownTotalBookingWeight - godownChallanWeight);
          
          // Calculate percentage for this godown
          const godownPercentage = godownTotalBookingWeight > 0 ? ((godownRemainingWeight / godownTotalBookingWeight) * 100) : 0;
          
          return {
            id: godown.id,
            name: godown.name,
            totalBookingWeight: godownTotalBookingWeight,
            totalChallanWeight: godownChallanWeight,
            remainingWeight: godownRemainingWeight,
            percentage: Math.round(godownPercentage),
            totalBookings: godownBookings.length,
            consignmentsInGodown: godownConsignmentsInGodown.length,
            cities: godown.cities
          };
        })
      });
    });

    return results.sort((a, b) => b.remainingWeight - a.remainingWeight); // Sort by remaining weight descending
  };

  const godownWeights = calculateRemainingWeight();
  const totalRemainingWeight = godownWeights.reduce((sum, g) => sum + g.remainingWeight, 0);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-6 py-4">
          <div className="animate-pulse">
            <div className="h-6 bg-white/20 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-white/20 rounded w-1/4"></div>
          </div>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-700 transform ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
    }`}>
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-6 py-4 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4 group">
              <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                Weight Status by Transporter
              </h3>
                <p className="text-blue-100 text-sm">
                  Total remaining: <span className="font-semibold text-white">{totalRemainingWeight.toLocaleString()} kg</span>
                </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Month Selector */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-blue-100">Month:</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300 text-white text-sm placeholder-blue-200"
              >
                {(() => {
                  const months = [];
                  const now = new Date();
                  for (let i = 0; i < 12; i++) {
                    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
                    months.push(
                      <option key={value} value={value} className="text-gray-900">
                        {label}
                      </option>
                    );
                  }
                  return months;
                })()}
              </select>
            </div>
            
            <Link
              to="/challans"
              className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white text-sm font-medium hover:bg-white/30 transition-all duration-300 flex items-center group"
            >
              View All
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        {godownWeights.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
            <p className="text-gray-500">
              {!targetTransporter 
                ? 'Target transporter not found or no godowns configured.' 
                : 'No godowns or bookings found for the selected month.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transporter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Booked (kg)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dispatched (kg)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Remaining (kg)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    In Godown
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {godownWeights.map((transporter, index) => (
                  <React.Fragment key={transporter.id}>
                    {/* Transporter Row */}
                    <tr 
                      className={`hover:bg-gray-50 transition-colors duration-200 ${
                        hoveredRow === transporter.id ? 'bg-blue-50' : ''
                      }`}
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animation: isVisible ? 'slideInUp 0.6s ease-out forwards' : 'none'
                      }}
                      onMouseEnter={() => setHoveredRow(transporter.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{transporter.name}</div>
                            <div className="text-sm text-gray-500">
                              {transporter.totalBookings} bookings • {transporter.hasGodowns ? `${transporter.godowns.length} godowns` : 'General transport'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="text-sm font-semibold text-blue-600">
                            {transporter.totalBookingWeight.toLocaleString()} kg
                          </div>
                            <div className="text-xs text-gray-500">Material received</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="text-sm font-semibold text-green-600">
                            {transporter.totalChallanWeight.toLocaleString()} kg
                          </div>
                            <div className="text-xs text-gray-500">Material dispatched</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-2">
                          <div className="text-sm font-bold text-orange-600">
                            {transporter.remainingWeight.toLocaleString()} kg
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="flex-1 bg-gray-200 rounded-full h-3 min-w-[80px]">
                              <div 
                                className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                                  transporter.percentage > 75 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                                  transporter.percentage > 50 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                                  transporter.percentage > 25 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                                  'bg-gradient-to-r from-green-500 to-green-600'
                                }`}
                                style={{
                                  width: `${Math.min(100, transporter.percentage)}%`,
                                  animation: isVisible ? 'progressFill 1.5s ease-out forwards' : 'none'
                                }}
                              ></div>
                            </div>
                            <div className="text-xs font-semibold text-gray-700 min-w-[50px]">
                              {transporter.percentage}%
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {transporter.percentage === 0 ? 'All dispatched' :
                             transporter.percentage === 100 ? 'Nothing dispatched' :
                             `${transporter.percentage}% remaining`}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="text-sm font-semibold text-purple-600">
                            {transporter.consignmentsInGodown}
                          </div>
                          <div className="text-xs text-gray-500">consignments</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          transporter.remainingWeight === 0 ? 'bg-green-100 text-green-800' :
                          transporter.percentage > 75 ? 'bg-red-100 text-red-800' :
                          transporter.percentage > 50 ? 'bg-yellow-100 text-yellow-800' :
                          transporter.percentage > 25 ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {transporter.remainingWeight === 0 ? 'Complete' :
                           transporter.percentage > 75 ? 'High' :
                           transporter.percentage > 50 ? 'Medium' :
                           transporter.percentage > 25 ? 'Low' : 'Minimal'}
                        </span>
                      </td>
                    </tr>

                    {/* Godown Rows (if any) */}
                    {transporter.hasGodowns && transporter.godowns.map((godown, godownIndex) => (
                      <tr 
                        key={`${transporter.id}-${godown.id}`}
                        className="bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                        style={{
                          animationDelay: `${(index * 100) + (godownIndex * 50)}ms`,
                          animation: isVisible ? 'slideInUp 0.6s ease-out forwards' : 'none'
                        }}
                      >
                        <td className="px-6 py-3 whitespace-nowrap pl-12">
                          <div className="flex items-center">
                            <div className="w-6 h-6 bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg flex items-center justify-center mr-3">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-700">{godown.name}</div>
                              <div className="text-xs text-gray-500">
                                {godown.totalBookings} bookings • {godown.cities.length} cities
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="text-sm font-semibold text-blue-600">
                              {godown.totalBookingWeight.toLocaleString()} kg
                            </div>
                            <div className="text-xs text-gray-500">Material received</div>
                          </div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="text-sm font-semibold text-green-600">
                              {godown.totalChallanWeight.toLocaleString()} kg
                            </div>
                            <div className="text-xs text-gray-500">Material dispatched</div>
                          </div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="space-y-2">
                            <div className="text-sm font-bold text-orange-600">
                              {godown.remainingWeight.toLocaleString()} kg
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[60px]">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-1000 ease-out ${
                                    godown.percentage > 75 ? 'bg-gradient-to-r from-red-400 to-red-500' :
                                    godown.percentage > 50 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                                    godown.percentage > 25 ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
                                    'bg-gradient-to-r from-green-400 to-green-500'
                                  }`}
                                  style={{
                                    width: `${Math.min(100, godown.percentage)}%`,
                                    animation: isVisible ? 'progressFill 1.5s ease-out forwards' : 'none'
                                  }}
                                ></div>
                              </div>
                              <div className="text-xs font-semibold text-gray-600 min-w-[40px]">
                                {godown.percentage}%
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {godown.percentage === 0 ? 'All dispatched' :
                               godown.percentage === 100 ? 'Nothing dispatched' :
                               `${godown.percentage}% remaining`}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="text-sm font-semibold text-purple-600">
                              {godown.consignmentsInGodown}
                            </div>
                            <div className="text-xs text-gray-500">consignments</div>
                          </div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            godown.remainingWeight === 0 ? 'bg-green-100 text-green-700' :
                            godown.percentage > 75 ? 'bg-red-100 text-red-700' :
                            godown.percentage > 50 ? 'bg-yellow-100 text-yellow-700' :
                            godown.percentage > 25 ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {godown.remainingWeight === 0 ? 'Complete' :
                             godown.percentage > 75 ? 'High' :
                             godown.percentage > 50 ? 'Medium' :
                             godown.percentage > 25 ? 'Low' : 'Minimal'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Section */}
      {godownWeights.length > 0 && (
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="text-center group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="text-xl font-bold text-gray-900">
                {godownWeights.length}
              </div>
              <div className="text-xs text-gray-600 font-medium">Active Transporters</div>
            </div>
            
            <div className="text-center group">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-xl font-bold text-gray-900">
                {godownWeights.reduce((sum, g) => sum + g.totalBookings, 0)}
              </div>
              <div className="text-xs text-gray-600 font-medium">Total Bookings</div>
            </div>
            
            <div className="text-center group">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="text-xl font-bold text-gray-900">
                {godownWeights.reduce((sum, g) => sum + g.totalChallans, 0)}
              </div>
              <div className="text-xs text-gray-600 font-medium">Total Dispatches</div>
            </div>
            
            <div className="text-center group">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="text-xl font-bold text-orange-600">
                {totalRemainingWeight.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600 font-medium">Remaining (kg)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GodownWeightTable;

