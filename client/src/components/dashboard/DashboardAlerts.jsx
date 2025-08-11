import React from 'react';

const DashboardAlerts = ({ alerts }) => {
  const getAlertStyles = (type) => {
    switch (type) {
      case 'error':
        return {
          bgColor: 'bg-red-50 border-red-200',
          iconBg: 'bg-red-100 text-red-600',
          textColor: 'text-red-800'
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-50 border-yellow-200',
          iconBg: 'bg-yellow-100 text-yellow-600',
          textColor: 'text-yellow-800'
        };
      case 'success':
        return {
          bgColor: 'bg-green-50 border-green-200',
          iconBg: 'bg-green-100 text-green-600',
          textColor: 'text-green-800'
        };
      default:
        return {
          bgColor: 'bg-blue-50 border-blue-200',
          iconBg: 'bg-blue-100 text-blue-600',
          textColor: 'text-blue-800'
        };
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'error':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'success':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  if (!alerts || alerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {alerts.map((alert, index) => {
        const styles = getAlertStyles(alert.type);
        return (
          <div
            key={alert.id || index}
            className={`${styles.bgColor} border rounded-lg p-3 flex items-start space-x-3 animate-slideIn`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`${styles.iconBg} rounded-full p-1.5 flex-shrink-0`}>
              {getAlertIcon(alert.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className={`${styles.textColor} text-sm font-medium`}>
                {alert.title}
              </div>
              {alert.message && (
                <div className={`${styles.textColor} text-xs mt-1 opacity-90`}>
                  {alert.message}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardAlerts; 