import React from 'react';

const WeightStep = ({ formData, setFormData }) => {
  const updateTotalWeight = (value) => {
    // Update total weight
    const updatedFormData = {
      ...formData,
      totalWeight: value
    };

    // Distribute weight equally among packages if there are packages
    if (formData.packages && formData.packages.length > 0) {
      const weightPerPackage = parseFloat(value) / formData.packages.length;
      updatedFormData.packages = formData.packages.map(pkg => ({
        ...pkg,
        weightKg: weightPerPackage % 1 === 0 ? weightPerPackage.toString() : weightPerPackage.toFixed(2)
      }));
    }

    setFormData(updatedFormData);
  };

  const calculateTotalItems = () => {
    return formData.packages?.reduce((total, pkg) => {
      return total + (parseInt(pkg.numberOfItems) || 0);
    }, 0) || 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Weight Information</h3>
      </div>

      {(!formData.packages || formData.packages.length === 0) ? (
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
          </svg>
          <p className="text-gray-500 mb-4">No packages available</p>
          <p className="text-sm text-gray-400">Please add packages in the previous step first</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Package Summary */}
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-700 mb-3">Package Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-blue-600 mb-1">Total Packages</p>
                <p className="text-lg font-bold text-blue-900">{formData.packages.length}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600 mb-1">Total Items</p>
                <p className="text-lg font-bold text-blue-900">{calculateTotalItems()}</p>
              </div>
            </div>
          </div>

          {/* Package Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">Package Details</h4>
            {formData.packages.map((pkg, index) => (
              <div key={pkg.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">
                      Package {index + 1}: {pkg.numberOfItems} {pkg.packagingType}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {pkg.itemDescription}
                    </p>
                  </div>
                  <div className="ml-4">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      value={pkg.weightKg || ''}
                      onChange={(e) => {
                        const newPackages = [...formData.packages];
                        newPackages[index] = {
                          ...newPackages[index],
                          weightKg: e.target.value
                        };
                        setFormData({
                          ...formData,
                          packages: newPackages,
                          totalWeight: (() => {
                            const total = newPackages.reduce((total, pkg) => 
                              total + (parseFloat(pkg.weightKg) || 0), 0
                            );
                            return total % 1 === 0 ? total.toString() : total.toFixed(2);
                          })()
                        });
                      }}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="0.0"
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total Weight Input */}
          <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-purple-700 mb-2">Total Weight for All Packages</h4>
              <p className="text-xs text-purple-600">
                Enter the total weight for all packages combined
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                  Total Weight (kg) *
                </label>
                <input
                  type="number"
                  value={formData.totalWeight || ''}
                  onChange={(e) => updateTotalWeight(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-sm"
                  required
                  placeholder="Enter total weight in kg"
                  min="0.1"
                  step="0.1"
                />
              </div>
              
              <div className="flex items-end">
                <div className="w-full bg-purple-100 rounded-lg p-3">
                  <p className="text-xs text-purple-600 mb-1">Summary</p>
                  <p className="text-sm font-medium text-purple-900">
                    {formData.packages.length} packages
                  </p>
                  <p className="text-xs text-purple-600">
                    {calculateTotalItems()} total items
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeightStep; 