import React from 'react';
import { Link } from 'react-router-dom';

const DashboardQuickActions = () => {
  const actions = [
    {
      title: 'New Booking',
      description: 'Create a new transport booking',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      href: '/bookings/create',
      bgColor: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Add Customer',
      description: 'Register a new customer',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      href: '/customers/create',
      bgColor: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Add Transporter',
      description: 'Register a new transporter',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      href: '/transporters/create',
      bgColor: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Add Vehicle',
      description: 'Register a new vehicle',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      href: '/vehicles/create',
      bgColor: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      title: 'Add Driver',
      description: 'Register a new driver',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      href: '/drivers/create',
      bgColor: 'bg-indigo-500 hover:bg-indigo-600'
    },
    {
      title: 'Add Expense',
      description: 'Record a new expense',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      href: '/expenses/create',
      bgColor: 'bg-red-500 hover:bg-red-600'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          <p className="text-sm text-gray-600">Get started with common tasks</p>
        </div>
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-blue-600 text-xs font-bold">{actions.length}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        {actions.map((action, index) => (
          <Link
            key={action.title}
            to={action.href}
            className={`group relative overflow-hidden rounded-lg p-3 text-white ${action.bgColor} transition-all duration-200 hover:shadow-md hover:scale-[1.01] animate-slideIn`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {action.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">
                  {action.title}
                </div>
                <div className="text-xs opacity-90 mt-0.5">
                  {action.description}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DashboardQuickActions; 