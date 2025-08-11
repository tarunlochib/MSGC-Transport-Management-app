import React from 'react';

const InvoicesStep = ({ formData, setFormData }) => {
  const addInvoice = () => {
    const newInvoice = {
      id: Date.now().toString(),
      invoiceNo: '',
      invoiceValue: ''
    };
    setFormData({
      ...formData,
      invoices: [...(formData.invoices || []), newInvoice]
    });
  };

  const removeInvoice = (index) => {
    const updatedInvoices = formData.invoices.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      invoices: updatedInvoices
    });
  };

  const updateInvoice = (index, field, value) => {
    const updatedInvoices = [...(formData.invoices || [])];
    updatedInvoices[index] = {
      ...updatedInvoices[index],
      [field]: value
    };
    setFormData({
      ...formData,
      invoices: updatedInvoices
    });
  };

  const calculateTotalInvoiceValue = () => {
    return formData.invoices?.reduce((total, invoice) => {
      return total + (parseFloat(invoice.invoiceValue) || 0);
    }, 0) || 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Invoice Information</h3>
        </div>
        <button
          type="button"
          onClick={addInvoice}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Invoice
        </button>
      </div>

      {(!formData.invoices || formData.invoices.length === 0) ? (
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 mb-4">No invoices added yet</p>
          <button
            type="button"
            onClick={addInvoice}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
          >
            Add First Invoice
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {formData.invoices.map((invoice, index) => (
            <div key={invoice.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-gray-700">Invoice {index + 1}</h4>
                {formData.invoices.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeInvoice(index)}
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
                    Invoice Number *
                  </label>
                  <input
                    type="text"
                    value={invoice.invoiceNo || ''}
                    onChange={(e) => updateInvoice(index, 'invoiceNo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm"
                    required
                    placeholder="Enter invoice number"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                    Invoice Value (₹) *
                  </label>
                  <input
                    type="number"
                    value={invoice.invoiceValue || ''}
                    onChange={(e) => updateInvoice(index, 'invoiceValue', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm"
                    required
                    placeholder="Enter invoice value"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Total Invoice Value */}
          {formData.invoices && formData.invoices.length > 0 && (
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-green-700">Total Invoice Value:</span>
                <span className="text-lg font-bold text-green-900">₹{calculateTotalInvoiceValue().toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InvoicesStep; 