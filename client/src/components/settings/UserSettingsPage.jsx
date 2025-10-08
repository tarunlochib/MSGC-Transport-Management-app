import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomDialog from '../common/CustomDialog';

const UserSettingsPage = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [dialog, setDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success'
  });
  const [settings, setSettings] = useState({
    theme: 'light',
    language: 'en',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    itemsPerPage: 10,
    autoSave: true,
    confirmDelete: true,
    showTooltips: true,
    compactMode: false,
    soundNotifications: false
  });

  useEffect(() => {
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      // Save to localStorage (in a real app, this would be saved to backend)
      localStorage.setItem('userSettings', JSON.stringify(settings));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDialog({
        isOpen: true,
        title: 'Settings Saved Successfully',
        message: 'Your application settings have been updated and saved.',
        type: 'success'
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      setDialog({
        isOpen: true,
        title: 'Save Failed',
        message: 'Failed to save settings. Please check your connection and try again.',
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const defaultSettings = {
      theme: 'light',
      language: 'en',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      itemsPerPage: 10,
      autoSave: true,
      confirmDelete: true,
      showTooltips: true,
      compactMode: false,
      soundNotifications: false
    };
    setSettings(defaultSettings);
  };

  const settingsSections = [
    {
      id: 'appearance',
      title: 'Appearance',
      description: 'Customize the look and feel',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
        </svg>
      ),
      color: 'blue',
      fields: [
        { 
          label: 'Theme', 
          name: 'theme', 
          type: 'select', 
          options: [
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'auto', label: 'Auto' }
          ]
        },
        { 
          label: 'Language', 
          name: 'language', 
          type: 'select', 
          options: [
            { value: 'en', label: 'English' },
            { value: 'hi', label: 'Hindi' }
          ]
        },
        { 
          label: 'Compact Mode', 
          name: 'compactMode', 
          type: 'toggle', 
          description: 'Use smaller spacing and elements'
        }
      ]
    },
    {
      id: 'format',
      title: 'Format & Localization',
      description: 'Date, time, and regional settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'green',
      fields: [
        { 
          label: 'Date Format', 
          name: 'dateFormat', 
          type: 'select', 
          options: [
            { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
            { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
            { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
          ]
        },
        { 
          label: 'Time Format', 
          name: 'timeFormat', 
          type: 'select', 
          options: [
            { value: '12', label: '12 Hour' },
            { value: '24', label: '24 Hour' }
          ]
        },
        { 
          label: 'Currency', 
          name: 'currency', 
          type: 'select', 
          options: [
            { value: 'INR', label: 'INR (₹)' },
            { value: 'USD', label: 'USD ($)' },
            { value: 'EUR', label: 'EUR (€)' }
          ]
        },
        { 
          label: 'Timezone', 
          name: 'timezone', 
          type: 'select', 
          options: [
            { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
            { value: 'UTC', label: 'UTC' },
            { value: 'America/New_York', label: 'America/New_York (EST)' }
          ]
        }
      ]
    },
    {
      id: 'behavior',
      title: 'Behavior',
      description: 'Application behavior settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'purple',
      fields: [
        { 
          label: 'Items Per Page', 
          name: 'itemsPerPage', 
          type: 'select', 
          options: [
            { value: 5, label: '5' },
            { value: 10, label: '10' },
            { value: 25, label: '25' },
            { value: 50, label: '50' },
            { value: 100, label: '100' }
          ]
        },
        { 
          label: 'Auto Save', 
          name: 'autoSave', 
          type: 'toggle', 
          description: 'Automatically save changes'
        },
        { 
          label: 'Confirm Delete', 
          name: 'confirmDelete', 
          type: 'toggle', 
          description: 'Show confirmation before deleting items'
        },
        { 
          label: 'Show Tooltips', 
          name: 'showTooltips', 
          type: 'toggle', 
          description: 'Display helpful tooltips'
        },
        { 
          label: 'Sound Notifications', 
          name: 'soundNotifications', 
          type: 'toggle', 
          description: 'Play sounds for notifications'
        }
      ]
    }
  ];

  const getColorClasses = (color) => {
    switch (color) {
      case 'blue': return { gradient: 'from-blue-500 to-blue-600', text: 'text-blue-600' };
      case 'green': return { gradient: 'from-green-500 to-green-600', text: 'text-green-600' };
      case 'purple': return { gradient: 'from-purple-500 to-purple-600', text: 'text-purple-600' };
      default: return { gradient: 'from-gray-500 to-gray-600', text: 'text-gray-600' };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(-1)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User Settings</h1>
                <p className="text-gray-600 text-sm">Customize your application experience and preferences</p>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-4">
          {settingsSections.map((section, index) => {
            const colorClasses = getColorClasses(section.color);
            return (
              <div
                key={section.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 section-card"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                {/* Section Header */}
                <div className={`bg-gradient-to-r ${colorClasses.gradient} p-4`}>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm floating-animation">
                      <div className="text-white">
                        {section.icon}
                      </div>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">{section.title}</h2>
                      <p className="text-white/80 text-xs">{section.description}</p>
                    </div>
                  </div>
                </div>

                {/* Section Fields */}
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.fields.map((field, fieldIndex) => (
                      <div
                        key={field.name}
                        className={`form-field ${field.type === 'toggle' ? 'md:col-span-2' : ''}`}
                        style={{
                          animationDelay: `${(index * 100) + (fieldIndex * 50)}ms`,
                          animation: 'slideIn 0.6s ease-out forwards'
                        }}
                      >
                        {field.type === 'select' ? (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {field.label}
                            </label>
                            <select
                              value={settings[field.name]}
                              onChange={(e) => handleSettingChange(field.name, field.name === 'itemsPerPage' ? parseInt(e.target.value) : e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                            >
                              {field.options.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : field.type === 'toggle' ? (
                          <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                            <div>
                              <h3 className="text-sm font-medium text-gray-900">{field.label}</h3>
                              {field.description && (
                                <p className="text-xs text-gray-500 mt-0.5">{field.description}</p>
                              )}
                            </div>
                            <button
                              onClick={() => handleSettingChange(field.name, !settings[field.name])}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all duration-200 ${
                                settings[field.name] ? 'bg-blue-600' : 'bg-gray-200'
                              }`}
                            >
                              <span
                                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ${
                                  settings[field.name] ? 'translate-x-5' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium text-sm"
          >
            Reset to Default
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center space-x-2 shadow-lg hover:shadow-xl text-sm transform hover:scale-105"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Save Settings</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Custom Dialog */}
      <CustomDialog
        isOpen={dialog.isOpen}
        onClose={() => setDialog({ ...dialog, isOpen: false })}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
      />

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .form-field {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .form-field:focus-within {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .section-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .section-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .floating-animation {
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0px);
          }
        }
      `}</style>
    </div>
  );
};

export default UserSettingsPage;
