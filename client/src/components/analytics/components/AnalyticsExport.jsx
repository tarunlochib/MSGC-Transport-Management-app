import React, { useState } from 'react';
import { motion } from 'framer-motion';

const AnalyticsExport = ({ onExport, isExporting, data }) => {
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [selectedSections, setSelectedSections] = useState(['kpis', 'revenue', 'operational']);

  const exportFormats = [
    { value: 'pdf', label: 'PDF Report', icon: '📄', description: 'Professional PDF report' },
    { value: 'excel', label: 'Excel Spreadsheet', icon: '📊', description: 'Data in Excel format' },
    { value: 'csv', label: 'CSV Data', icon: '📋', description: 'Raw data export' },
    { value: 'json', label: 'JSON Data', icon: '🔧', description: 'Structured data format' }
  ];

  const exportSections = [
    { value: 'kpis', label: 'Key Performance Indicators', icon: '📈' },
    { value: 'revenue', label: 'Revenue Analytics', icon: '💰' },
    { value: 'operational', label: 'Operational Metrics', icon: '⚡' },
    { value: 'customers', label: 'Customer Analytics', icon: '👥' },
    { value: 'transporters', label: 'Transporter Analytics', icon: '🚛' },
    { value: 'predictions', label: 'Predictive Analytics', icon: '🔮' }
  ];

  const handleSectionToggle = (section) => {
    setSelectedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleExport = () => {
    onExport(selectedFormat, selectedSections);
  };

  const selectAllSections = () => {
    setSelectedSections(exportSections.map(s => s.value));
  };

  const clearAllSections = () => {
    setSelectedSections([]);
  };

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
          <h3 className="text-lg font-semibold text-gray-900">Export Analytics</h3>
          <p className="text-sm text-gray-600">Download reports and data in various formats</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={selectAllSections}
            className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Select All
          </button>
          <button
            onClick={clearAllSections}
            className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-700"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Format Selection */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Export Format</h4>
          <div className="space-y-2">
            {exportFormats.map((format) => (
              <button
                key={format.value}
                onClick={() => setSelectedFormat(format.value)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 ${
                  selectedFormat === format.value
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-xl">{format.icon}</span>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">{format.label}</p>
                  <p className="text-xs text-gray-600">{format.description}</p>
                </div>
                {selectedFormat === format.value && (
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Section Selection */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Include Sections</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {exportSections.map((section) => (
              <button
                key={section.value}
                onClick={() => handleSectionToggle(section.value)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 ${
                  selectedSections.includes(section.value)
                    ? 'bg-green-50 border-green-300 text-green-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">{section.icon}</span>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">{section.label}</p>
                </div>
                {selectedSections.includes(section.value) && (
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h5 className="text-sm font-medium text-gray-900">Export Options</h5>
            <p className="text-xs text-gray-600">
              {selectedSections.length} section(s) selected • {selectedFormat.toUpperCase()} format
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExport}
              disabled={isExporting || selectedSections.length === 0}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Exporting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Analytics
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Export History */}
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Recent Exports</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-lg">📄</span>
              <div>
                <p className="text-sm font-medium text-gray-900">Analytics Report - PDF</p>
                <p className="text-xs text-gray-600">2 hours ago • 2.3 MB</p>
              </div>
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-700">
              Download
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-lg">📊</span>
              <div>
                <p className="text-sm font-medium text-gray-900">Revenue Data - Excel</p>
                <p className="text-xs text-gray-600">1 day ago • 1.8 MB</p>
              </div>
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-700">
              Download
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AnalyticsExport;
