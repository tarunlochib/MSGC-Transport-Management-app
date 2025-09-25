import React, { useState } from 'react';
import axios from 'axios';

const WeightMigrationPage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [migrationType, setMigrationType] = useState('weights'); // 'weights', 'charges', or 'challans'

  const runMigration = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    
    try {
      let endpoint;
      if (migrationType === 'weights') {
        endpoint = '/api/migration/cleanup-weights';
      } else if (migrationType === 'charges') {
        endpoint = '/api/migration/cleanup-charges';
      } else if (migrationType === 'challans') {
        endpoint = '/api/challans/cleanup-decimals';
      }
      const response = await axios.post(endpoint);
      setResult(response.data);
    } catch (err) {
      console.error('Migration failed:', err);
      setError(err.response?.data?.error || 'An unexpected error occurred during migration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 mt-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Cleanup Migration</h2>
        
        {/* Migration Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Select Migration Type:</label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                value="weights"
                checked={migrationType === 'weights'}
                onChange={(e) => setMigrationType(e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">Weight Values Cleanup</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="charges"
                checked={migrationType === 'charges'}
                onChange={(e) => setMigrationType(e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">Charges & Income Cleanup</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="challans"
                checked={migrationType === 'challans'}
                onChange={(e) => setMigrationType(e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">Challan Values Cleanup</span>
            </label>
          </div>
        </div>

        {migrationType === 'weights' ? (
          <>
            <p className="text-gray-700 mb-6">
              This utility will clean up existing weight values in your database. Since weights should always 
              be whole numbers, it will convert all decimal values to the nearest whole number (e.g., 230.01 → 230, 230.7 → 231).
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Weight Cleanup Notes:</h3>
              <ul className="text-yellow-700 text-sm space-y-1">
                <li>• This will update existing booking and package weight values</li>
                <li>• All decimal values will be rounded to whole numbers</li>
                <li>• Examples: 230.01 → 230, 230.7 → 231, 230.5 → 231</li>
                <li>• Make sure to backup your database before running this</li>
              </ul>
            </div>
          </>
        ) : migrationType === 'charges' ? (
          <>
            <p className="text-gray-700 mb-6">
              This utility will clean up existing charge and income values in your database. It will fix decimal 
              precision issues and ensure all amounts are proper whole numbers (e.g., 1099.98 → 1100).
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Charges Cleanup Notes:</h3>
              <ul className="text-yellow-700 text-sm space-y-1">
                <li>• This will update existing booking total charges and income amounts</li>
                <li>• All decimal values will be rounded to whole numbers</li>
                <li>• Examples: 1099.98 → 1100, 1500.01 → 1500</li>
                <li>• Make sure to backup your database before running this</li>
              </ul>
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-700 mb-6">
              This utility will clean up existing challan weight and charge values in your database. It will fix decimal 
              precision issues and ensure all challan values are proper whole numbers (e.g., 1099.98 → 1100).
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Challan Cleanup Notes:</h3>
              <ul className="text-yellow-700 text-sm space-y-1">
                <li>• This will update existing challan total weight, total charges, and individual challan goods</li>
                <li>• All decimal values will be rounded to whole numbers</li>
                <li>• Examples: 1099.98 → 1100, 230.01 → 230</li>
                <li>• Make sure to backup your database before running this</li>
              </ul>
            </div>
          </>
        )}

        <button
          onClick={runMigration}
          disabled={loading}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200
            ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? `Running ${migrationType === 'weights' ? 'Weight' : migrationType === 'charges' ? 'Charges' : 'Challan'} Cleanup...` : `Run ${migrationType === 'weights' ? 'Weight' : migrationType === 'charges' ? 'Charges' : 'Challan'} Cleanup`}
        </button>

        {loading && (
          <div className="flex items-center justify-center mt-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
            <p className="text-blue-600">Processing...</p>
          </div>
        )}

        {result && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">
              {migrationType === 'weights' ? 'Weight' : migrationType === 'charges' ? 'Charges' : 'Challan'} Cleanup Completed Successfully!
            </h3>
            
            <div className="space-y-2">
              {migrationType === 'weights' ? (
                <>
                  <div>
                    <h4 className="font-semibold">Bookings:</h4>
                    <p>Total: {result.summary.bookings.total}</p>
                    <p>Updated: {result.summary.bookings.updated}</p>
                    <p>Skipped: {result.summary.bookings.skipped}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold">Packages:</h4>
                    <p>Total: {result.summary.packages.total}</p>
                    <p>Updated: {result.summary.packages.updated}</p>
                    <p>Skipped: {result.summary.packages.skipped}</p>
                  </div>
                </>
              ) : migrationType === 'charges' ? (
                <>
                  <div>
                    <h4 className="font-semibold">Bookings:</h4>
                    <p>Total: {result.summary.bookings.total}</p>
                    <p>Updated: {result.summary.bookings.updated}</p>
                    <p>Skipped: {result.summary.bookings.skipped}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold">Income Entries:</h4>
                    <p>Total: {result.summary.income.total}</p>
                    <p>Updated: {result.summary.income.updated}</p>
                    <p>Skipped: {result.summary.income.skipped}</p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h4 className="font-semibold">Challans:</h4>
                    <p>Total: {result.summary.challans.total}</p>
                    <p>Updated: {result.summary.challans.updated}</p>
                    <p>Skipped: {result.summary.challans.skipped}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold">Challan Goods:</h4>
                    <p>Total: {result.summary.challanGoods.total}</p>
                    <p>Updated: {result.summary.challanGoods.updated}</p>
                    <p>Skipped: {result.summary.challanGoods.skipped}</p>
                  </div>
                </>
              )}
            </div>
            
            <p className="mt-3 text-sm">
              Please refresh your pages to see the updated values.
            </p>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">
              {migrationType === 'weights' ? 'Weight' : migrationType === 'charges' ? 'Charges' : 'Challan'} Cleanup Failed!
            </h3>
            <p>{error}</p>
            <p className="mt-2">Please try again or contact support if the issue persists.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeightMigrationPage;
