// Notification Service - Self-contained without external services
class NotificationService {
  constructor() {
    this.preferences = this.loadPreferences();
    this.notificationQueue = [];
    this.isProcessing = false;
    this.init();
  }

  init() {
    // Request notification permission
    if ('Notification' in window) {
      Notification.requestPermission();
    }
    
    // Load preferences from localStorage
    this.preferences = this.loadPreferences();
    
    // Start processing queue
    this.processQueue();
  }

  loadPreferences() {
    const saved = localStorage.getItem('notificationPreferences');
    return saved ? JSON.parse(saved) : {
      emailNotifications: true,
      bookingNotifications: true,
      paymentNotifications: true,
      challanNotifications: true,
      expenseNotifications: false,
      systemNotifications: true,
      dailyReports: false,
      weeklyReports: true,
      monthlyReports: true
    };
  }

  updatePreferences(newPreferences) {
    this.preferences = { ...this.preferences, ...newPreferences };
    localStorage.setItem('notificationPreferences', JSON.stringify(this.preferences));
  }

  // Add notification to queue
  addNotification(type, title, message, data = {}) {
    const notification = {
      id: Date.now() + Math.random(),
      type,
      title,
      message,
      data,
      timestamp: new Date(),
      read: false
    };

    this.notificationQueue.push(notification);
    this.saveNotificationHistory(notification);
    
    // Process immediately if enabled
    if (this.isNotificationEnabled(type)) {
      this.showNotification(notification);
    }
  }

  // Check if notification type is enabled
  isNotificationEnabled(type) {
    const typeMap = {
      'booking': 'bookingNotifications',
      'payment': 'paymentNotifications',
      'challan': 'challanNotifications',
      'expense': 'expenseNotifications',
      'system': 'systemNotifications',
      'report': 'dailyReports' // or weeklyReports, monthlyReports
    };

    const preferenceKey = typeMap[type];
    return preferenceKey ? this.preferences[preferenceKey] : true;
  }

  // Show browser notification
  showNotification(notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.type,
        data: notification.data
      });

      // Auto close after 5 seconds
      setTimeout(() => {
        browserNotification.close();
      }, 5000);

      // Handle click
      browserNotification.onclick = () => {
        window.focus();
        browserNotification.close();
        this.markAsRead(notification.id);
      };
    }

    // Also show in-app notification
    this.showInAppNotification(notification);
  }

  // Show in-app notification
  showInAppNotification(notification) {
    // Create notification element
    const notificationEl = document.createElement('div');
    notificationEl.className = `fixed top-4 right-4 z-50 max-w-sm w-full bg-white rounded-lg shadow-lg border-l-4 ${
      notification.type === 'error' ? 'border-red-500' : 
      notification.type === 'success' ? 'border-green-500' : 
      'border-blue-500'
    } p-4 transform translate-x-full transition-transform duration-300`;
    
    notificationEl.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <div class="w-8 h-8 rounded-full flex items-center justify-center ${
            notification.type === 'error' ? 'bg-red-100' : 
            notification.type === 'success' ? 'bg-green-100' : 
            'bg-blue-100'
          }">
            <svg class="w-4 h-4 ${
              notification.type === 'error' ? 'text-red-600' : 
              notification.type === 'success' ? 'text-green-600' : 
              'text-blue-600'
            }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              ${notification.type === 'error' ? 
                '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>' :
                notification.type === 'success' ?
                '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>' :
                '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
              }
            </svg>
          </div>
        </div>
        <div class="ml-3 flex-1">
          <h4 class="text-sm font-medium text-gray-900">${notification.title}</h4>
          <p class="text-sm text-gray-500 mt-1">${notification.message}</p>
        </div>
        <button class="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600" onclick="this.parentElement.parentElement.remove()">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `;

    document.body.appendChild(notificationEl);

    // Animate in
    setTimeout(() => {
      notificationEl.classList.remove('translate-x-full');
    }, 100);

    // Auto remove after 5 seconds
    setTimeout(() => {
      notificationEl.classList.add('translate-x-full');
      setTimeout(() => {
        if (notificationEl.parentNode) {
          notificationEl.parentNode.removeChild(notificationEl);
        }
      }, 300);
    }, 5000);
  }

  // Save notification to history
  saveNotificationHistory(notification) {
    const history = this.getNotificationHistory();
    history.unshift(notification);
    
    // Keep only last 100 notifications
    if (history.length > 100) {
      history.splice(100);
    }
    
    localStorage.setItem('notificationHistory', JSON.stringify(history));
  }

  // Get notification history
  getNotificationHistory() {
    const history = localStorage.getItem('notificationHistory');
    return history ? JSON.parse(history) : [];
  }

  // Mark notification as read
  markAsRead(notificationId) {
    const history = this.getNotificationHistory();
    const notification = history.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      localStorage.setItem('notificationHistory', JSON.stringify(history));
    }
  }

  // Get unread count
  getUnreadCount() {
    const history = this.getNotificationHistory();
    return history.filter(n => !n.read).length;
  }

  // Process notification queue
  processQueue() {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    
    while (this.notificationQueue.length > 0) {
      const notification = this.notificationQueue.shift();
      if (this.isNotificationEnabled(notification.type)) {
        this.showNotification(notification);
      }
    }
    
    this.isProcessing = false;
  }

  // Simulate booking notification
  simulateBookingNotification() {
    this.addNotification('booking', 'New Booking Created', 'A new booking has been created in the system.', {
      bookingId: 'BK' + Date.now(),
      customer: 'Sample Customer'
    });
  }

  // Simulate payment notification
  simulatePaymentNotification() {
    this.addNotification('payment', 'Payment Received', 'Payment has been received for booking.', {
      amount: 1500,
      bookingId: 'BK' + Date.now()
    });
  }

  // Simulate challan notification
  simulateChallanNotification() {
    this.addNotification('challan', 'Challan Generated', 'A new challan has been generated.', {
      challanId: 'CH' + Date.now(),
      vehicle: 'MH-12-AB-1234'
    });
  }

  // Simulate expense notification
  simulateExpenseNotification() {
    this.addNotification('expense', 'Expense Added', 'A new expense has been recorded.', {
      amount: 500,
      type: 'Fuel'
    });
  }

  // Simulate system notification
  simulateSystemNotification() {
    this.addNotification('system', 'System Update', 'System has been updated successfully.', {
      version: '1.0.0'
    });
  }

  // Generate daily report notification
  generateDailyReport() {
    if (this.preferences.dailyReports) {
      this.addNotification('report', 'Daily Report Ready', 'Your daily business report is ready for review.', {
        type: 'daily',
        date: new Date().toDateString()
      });
    }
  }

  // Generate weekly report notification
  generateWeeklyReport() {
    if (this.preferences.weeklyReports) {
      this.addNotification('report', 'Weekly Report Ready', 'Your weekly business report is ready for review.', {
        type: 'weekly',
        week: new Date().toDateString()
      });
    }
  }

  // Generate monthly report notification
  generateMonthlyReport() {
    if (this.preferences.monthlyReports) {
      this.addNotification('report', 'Monthly Report Ready', 'Your monthly business report is ready for review.', {
        type: 'monthly',
        month: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      });
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;
