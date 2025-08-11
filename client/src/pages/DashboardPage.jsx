import React, { useState, useEffect } from 'react';
import DashboardHome from '../components/dashboard/DashboardHome';

const DashboardPage = () => {
  const [apiStatus, setApiStatus] = useState({ status: 'checking' });

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        // Test API health by making a simple request
        const response = await fetch('/api/health', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          setApiStatus({ status: 'healthy' });
        } else {
          setApiStatus({ status: 'unhealthy' });
        }
      } catch (error) {
        console.error('API health check failed:', error);
        setApiStatus({ status: 'unhealthy' });
      }
    };

    // Check API status immediately
    checkApiStatus();

    // Check API status every 30 seconds
    const interval = setInterval(checkApiStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  return <DashboardHome apiStatus={apiStatus} />;
};

export default DashboardPage; 