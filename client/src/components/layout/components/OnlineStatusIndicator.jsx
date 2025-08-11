import React, { useState, useEffect } from 'react';

const OnlineStatusIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const handleOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  const getStatusColor = () => {
    return isOnline 
      ? 'bg-green-50 text-green-700 border-green-200' 
      : 'bg-red-50 text-red-700 border-red-200';
  };

  const getStatusDotColor = () => {
    return isOnline ? 'bg-green-500' : 'bg-red-500';
  };

  const getStatusText = () => {
    return isOnline ? 'Online' : 'Offline';
  };

  const getStatusDescription = () => {
    return isOnline 
      ? 'Connected to the internet' 
      : 'No internet connection';
  };

  return (
    <div className="relative group">
      <div
        className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 border shadow-sm cursor-pointer hover:shadow-md ${getStatusColor()}`}
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className={`w-2 h-2 rounded-full animate-pulse ${getStatusDotColor()}`}></div>
        <span className="font-medium">{getStatusText()}</span>
      </div>

      {/* Status Details Tooltip */}
      {showDetails && (
        <div className="absolute top-full mt-2 left-0 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50 animate-slideDown">
          <div className="p-3">
            <div className="flex items-center space-x-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${getStatusDotColor()}`}></div>
              <span className="text-sm font-medium text-gray-900">{getStatusText()}</span>
            </div>
            <p className="text-xs text-gray-500">{getStatusDescription()}</p>
            <div className="mt-2 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Connection:</span>
                <span className={`font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                  {isOnline ? 'Stable' : 'Unavailable'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnlineStatusIndicator; 