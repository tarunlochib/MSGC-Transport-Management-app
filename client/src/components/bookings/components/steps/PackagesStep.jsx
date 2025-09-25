import React from 'react';

const PackagesStep = ({ formData, setFormData }) => {
  const packagingTypes = [
    'BOX',
    'Carton', 
    'Bags',
    'Nags',
    'Loose',
    'Wooden Box',
    'Barrels',
    'Rolls',
    'Pallets',
    'Crates',
    'Drums',
    'Sacks',
    'Bundles',
    'Cases'
  ];

  const addPackage = () => {
    const newPackage = {
      id: Date.now().toString(),
      numberOfItems: '',
      packagingType: '',
      itemDescription: ''
    };
    setFormData({
      ...formData,
      packages: [...(formData.packages || []), newPackage]
    });
  };

  const removePackage = (index) => {
    const updatedPackages = formData.packages.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      packages: updatedPackages
    });
  };

  const updatePackage = (index, field, value) => {
    const updatedPackages = [...(formData.packages || [])];
    updatedPackages[index] = {
      ...updatedPackages[index],
      [field]: value
    };
    setFormData({
      ...formData,
      packages: updatedPackages
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Goods Information</h3>
        </div>
        <button
          type="button"
          onClick={addPackage}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Package
        </button>
      </div>

      {(!formData.packages || formData.packages.length === 0) ? (
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-gray-500 mb-4">No packages added yet</p>
          <button
            type="button"
            onClick={addPackage}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
          >
            Add First Package
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {formData.packages.map((pkg, index) => (
            <div key={pkg.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-gray-700">Package {index + 1}</h4>
                {formData.packages.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePackage(index)}
                    className="text-red-600 hover:text-red-800 transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                    Number of Items *
                  </label>
                  <input
                    type="number"
                    value={pkg.numberOfItems || ''}
                    onChange={(e) => updatePackage(index, 'numberOfItems', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                    required
                    placeholder="Enter number of items"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                    Type of Packaging *
                  </label>
                  <select
                    value={pkg.packagingType || ''}
                    onChange={(e) => updatePackage(index, 'packagingType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                    required
                  >
                    <option value="">Select Packaging Type</option>
                    {packagingTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                  Item Description *
                </label>
                <textarea
                  value={pkg.itemDescription || ''}
                  onChange={(e) => updatePackage(index, 'itemDescription', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                  required
                  placeholder="Describe the items in this package"
                  rows="3"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PackagesStep; 