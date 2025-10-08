import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import CustomDialog from '../common/CustomDialog';

const CompanyProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [company, setCompany] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
    gstNumber: '',
    panNumber: '',
    website: '',
    logo: '',
    bankName: '',
    bankAccount: '',
    ifscCode: '',
    termsAndConditions: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [dialog, setDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success'
  });

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  const fetchCompanyProfile = async () => {
    try {
      const response = await api.get('/company');
      setCompany(response.data || {
        name: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        phone: '',
        email: '',
        gstNumber: '',
        panNumber: '',
        website: '',
        logo: '',
        bankName: '',
        bankAccount: '',
        ifscCode: '',
        termsAndConditions: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error fetching company profile:', error);
      // Set default values if API fails
      setCompany({
        name: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        phone: '',
        email: '',
        gstNumber: '',
        panNumber: '',
        website: '',
        logo: '',
        bankName: '',
        bankAccount: '',
        ifscCode: '',
        termsAndConditions: '',
        notes: ''
      });
    } finally {
      setLoading(false);
    }
  };

  // Validation functions
  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'name':
        if (!value.trim()) {
          newErrors[name] = 'Company name is required';
        } else if (value.trim().length < 2) {
          newErrors[name] = 'Company name must be at least 2 characters';
        } else {
          delete newErrors[name];
        }
        break;
        
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors[name] = 'Please enter a valid email address';
        } else {
          delete newErrors[name];
        }
        break;
        
      case 'phone':
        if (value && !/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, ''))) {
          newErrors[name] = 'Please enter a valid phone number';
        } else {
          delete newErrors[name];
        }
        break;
        
      case 'gstNumber':
        if (value && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value)) {
          newErrors[name] = 'Please enter a valid GST number';
        } else {
          delete newErrors[name];
        }
        break;
        
      case 'panNumber':
        if (value && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) {
          newErrors[name] = 'Please enter a valid PAN number';
        } else {
          delete newErrors[name];
        }
        break;
        
      case 'pincode':
        if (value && !/^[1-9][0-9]{5}$/.test(value)) {
          newErrors[name] = 'Please enter a valid 6-digit pincode';
        } else {
          delete newErrors[name];
        }
        break;
        
      case 'ifscCode':
        if (value && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value)) {
          newErrors[name] = 'Please enter a valid IFSC code';
        } else {
          delete newErrors[name];
        }
        break;
        
      case 'website':
        if (value && !/^https?:\/\/.+\..+/.test(value)) {
          newErrors[name] = 'Please enter a valid website URL';
        } else {
          delete newErrors[name];
        }
        break;
        
      case 'address':
        if (!value.trim()) {
          newErrors[name] = 'Address is required';
        } else if (value.trim().length < 10) {
          newErrors[name] = 'Address must be at least 10 characters';
        } else {
          delete newErrors[name];
        }
        break;
        
      default:
        delete newErrors[name];
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCompany(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validate field on change
    validateField(name, value);
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!company.name.trim()) {
      newErrors.name = 'Company name is required';
    }
    if (!company.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    // Validate all fields
    Object.keys(company).forEach(key => {
      validateField(key, company[key]);
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(company).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);
    
    // Validate form
    if (!validateForm()) {
      setDialog({
        isOpen: true,
        title: 'Validation Error',
        message: 'Please fix the errors in the form before submitting.',
        type: 'error'
      });
      return;
    }
    
    setSaving(true);

    try {
      await api.put('/company', company);
      setDialog({
        isOpen: true,
        title: 'Profile Updated Successfully',
        message: 'Your company profile has been updated and saved.',
        type: 'success'
      });
    } catch (error) {
      console.error('Error updating company profile:', error);
      setDialog({
        isOpen: true,
        title: 'Update Failed',
        message: 'Failed to update company profile. Please check your connection and try again.',
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const formSections = [
    {
      id: 'basic',
      title: 'Basic Information',
      description: 'Essential company details',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: 'blue',
      fields: [
        { name: 'name', label: 'Company Name', type: 'text', required: true, placeholder: 'Enter company name' },
        { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: 'Enter phone number' },
        { name: 'address', label: 'Address', type: 'textarea', required: true, placeholder: 'Enter company address', rows: 3, fullWidth: true },
        { name: 'city', label: 'City', type: 'text', placeholder: 'Enter city' },
        { name: 'state', label: 'State', type: 'text', placeholder: 'Enter state' },
        { name: 'pincode', label: 'Pincode', type: 'text', placeholder: 'Enter pincode' },
        { name: 'email', label: 'Email', type: 'email', placeholder: 'Enter email address' }
      ]
    },
    {
      id: 'tax',
      title: 'Tax Information',
      description: 'GST and PAN details',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'green',
      fields: [
        { name: 'gstNumber', label: 'GST Number', type: 'text', placeholder: 'Enter GST number' },
        { name: 'panNumber', label: 'PAN Number', type: 'text', placeholder: 'Enter PAN number' }
      ]
    },
    {
      id: 'banking',
      title: 'Banking Information',
      description: 'Bank account details',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      color: 'purple',
      fields: [
        { name: 'bankName', label: 'Bank Name', type: 'text', placeholder: 'Enter bank name' },
        { name: 'bankAccount', label: 'Account Number', type: 'text', placeholder: 'Enter account number' },
        { name: 'ifscCode', label: 'IFSC Code', type: 'text', placeholder: 'Enter IFSC code' },
        { name: 'website', label: 'Website', type: 'url', placeholder: 'Enter website URL' }
      ]
    },
    {
      id: 'additional',
      title: 'Additional Information',
      description: 'Terms, conditions and notes',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'orange',
      fields: [
        { name: 'termsAndConditions', label: 'Terms & Conditions', type: 'textarea', placeholder: 'Enter terms and conditions', rows: 4, fullWidth: true },
        { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Enter any additional notes', rows: 3, fullWidth: true }
      ]
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        gradient: 'from-blue-500 to-blue-600'
      },
      green: {
        gradient: 'from-green-500 to-green-600'
      },
      purple: {
        gradient: 'from-purple-500 to-purple-600'
      },
      orange: {
        gradient: 'from-orange-500 to-orange-600'
      }
    };
    return colors[color] || colors.blue;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading company profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
                <p className="text-gray-600 text-sm">Manage your company information and details</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Sections */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {formSections.map((section, index) => {
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
                        className={`form-field ${field.fullWidth ? 'md:col-span-2' : ''}`}
                        style={{
                          animationDelay: `${(index * 100) + (fieldIndex * 50)}ms`,
                          animation: 'slideIn 0.6s ease-out forwards'
                        }}
                      >
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        {field.type === 'textarea' ? (
                          <textarea
                            name={field.name}
                            value={company[field.name]}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            required={field.required}
                            rows={field.rows || 3}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                              errors[field.name] && touched[field.name] 
                                ? 'border-red-500 bg-red-50' 
                                : 'border-gray-300'
                            }`}
                            placeholder={field.placeholder}
                          />
                        ) : (
                          <input
                            type={field.type}
                            name={field.name}
                            value={company[field.name]}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            required={field.required}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                              errors[field.name] && touched[field.name] 
                                ? 'border-red-500 bg-red-50' 
                                : 'border-gray-300'
                            }`}
                            placeholder={field.placeholder}
                          />
                        )}
                        {errors[field.name] && touched[field.name] && (
                          <div className="mt-1 text-sm text-red-600 animate-fadeIn">
                            {errors[field.name]}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
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
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Custom Dialog */}
      <CustomDialog
        isOpen={dialog.isOpen}
        onClose={() => setDialog(prev => ({ ...prev, isOpen: false }))}
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
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
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
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideIn {
          animation: slideIn 0.4s ease-out;
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
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
        
        .gradient-bg {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

export default CompanyProfilePage;