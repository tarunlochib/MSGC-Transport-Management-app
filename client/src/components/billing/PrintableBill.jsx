import React from 'react';

const PrintableBill = ({ billData, onClose }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
  };

  const getMonthName = (month) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  };

  const formatWeight = (weight) => {
    return `${parseFloat(weight).toLocaleString('en-IN')} kg`;
  };

  const formatContactInfo = (contactInfo) => {
    if (!contactInfo) return 'N/A';
    
    // If it's a JSON string, try to parse it
    if (typeof contactInfo === 'string' && contactInfo.startsWith('{')) {
      try {
        const parsed = JSON.parse(contactInfo);
        const parts = [];
        
        if (parsed.email) parts.push(`Email: ${parsed.email}`);
        if (parsed.phone) parts.push(`Phone: ${parsed.phone}`);
        if (parsed.gstNumber) parts.push(`GST: ${parsed.gstNumber}`);
        if (parsed.panNumber) parts.push(`PAN: ${parsed.panNumber}`);
        
        return parts.length > 0 ? parts.join('\n') : 'N/A';
      } catch (e) {
        // If parsing fails, return the original string
        return contactInfo;
      }
    }
    
    // If it's already a simple string, return as is
    return contactInfo;
  };



    const handlePrint = () => {
    // Create a new window for printing to isolate the bill content
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    const printPage = document.querySelector('.print-page');
    
    if (printWindow && printPage) {
      // Create professional, minimal title with transporter name
      const transporterName = billData.transporter?.name || billData.transporterName || 'Transporter';
      const monthYear = `${getMonthName(billData.month)} ${billData.year}`;
      
      const printContent = `
         <!DOCTYPE html>
         <html>
         <head>
           <title>${transporterName} - ${monthYear} Bill</title>
           <meta name="description" content="Monthly bill for ${transporterName} - ${monthYear}">
           <meta property="og:title" content="${transporterName} - ${monthYear} Bill">
           <style>
            @page {
              margin: 0.5in;
              size: A4;
            }
            
            body { 
              margin: 0; 
              padding: 20px;
              font-family: Arial, sans-serif;
              font-size: 12px;
              line-height: 1.4;
              background: white;
              color: black;
            }
            
            .bill-header { 
              background: white;
              color: black;
              border-bottom: 2px solid #000;
              margin-bottom: 20px;
              padding-bottom: 15px;
            }
            
            .bill-table {
              border-collapse: collapse;
              width: 100%;
              font-size: 10px;
              margin-bottom: 20px;
              page-break-inside: avoid;
            }
            
            .bill-table th,
            .bill-table td {
              border: 1px solid #000;
              padding: 4px 6px;
              text-align: left;
              vertical-align: top;
            }
            
            .bill-table th {
              background-color: #f3f4f6;
              color: black;
              font-weight: bold;
              text-align: center;
            }
            
            .bill-table tr:nth-child(even) {
              background-color: #f9fafb;
            }
            
            .section-title {
              font-size: 14px;
              font-weight: 700;
              margin-bottom: 8px;
              color: #000;
              border-bottom: 2px solid #000;
              padding-bottom: 4px;
              page-break-after: avoid;
            }
            
            .company-name {
              font-size: 18px;
              font-weight: 700;
              color: #000;
            }
            
            .bill-title {
              font-size: 16px;
              font-weight: 700;
              color: #000;
            }
            
            .detail-label {
              font-weight: 600;
              color: #000;
            }
            
            .detail-value {
              font-weight: 500;
              color: #000;
            }
            
            .bg-green-50 {
              background-color: #f0fdf4;
              border: 1px solid #000;
            }
            
            .bg-blue-50 {
              background-color: #eff6ff;
              border: 1px solid #000;
            }
            
            .bg-gray-50 {
              background-color: #f9fafb;
              border: 1px solid #000;
            }
            
            .border-t {
              border-top: 1px solid #000;
            }
            
            img {
              max-width: 60px;
              height: auto;
            }
            
            .mb-4, .mb-6, .mb-8 {
              margin-bottom: 15px;
            }
            
            .mt-8 {
              margin-top: 20px;
            }
            
            .p-2, .p-3, .p-6 {
              padding: 8px;
            }
            
            .grid {
              display: grid;
            }
            
            .grid-cols-2 {
              grid-template-columns: 1fr 1fr;
            }
            
            .text-green-600, .text-blue-600 {
              color: #000;
              font-weight: bold;
            }
            
            .overflow-x-auto {
              overflow: visible;
            }
            
            .flex {
              display: flex;
            }
            
            .items-center {
              align-items: center;
            }
            
            .justify-between {
              justify-content: space-between;
            }
            
            .space-x-3 > * + * {
              margin-left: 12px;
            }
            
            .space-y-2 > * + * {
              margin-top: 8px;
            }
            
            .space-y-1 > * + * {
              margin-top: 4px;
            }
            
            .gap-4 {
              gap: 16px;
            }
            
            .gap-6 {
              gap: 24px;
            }
            
            .text-right {
              text-align: right;
            }
            
            .text-center {
              text-align: center;
            }
            
            .text-sm {
              font-size: 11px;
            }
            
            .text-xs {
              font-size: 10px;
            }
            
            .text-lg {
              font-size: 16px;
            }
            
            .w-12 {
              width: 48px;
            }
            
            .h-12 {
              height: 48px;
            }
            
            .w-full {
              width: 100%;
            }
            
            .max-w-4xl {
              max-width: 896px;
            }
            
            .mx-auto {
              margin-left: auto;
              margin-right: auto;
            }
            
            .rounded {
              border-radius: 4px;
            }
            
            .border {
              border: 1px solid #d1d5db;
            }
            
            .border-b {
              border-bottom: 1px solid #d1d5db;
            }
            
            .border-gray-200 {
              border-color: #e5e7eb;
            }
            
            .border-gray-300 {
              border-color: #d1d5db;
            }
            
            .border-gray-400 {
              border-color: #9ca3af;
            }
            
            .pb-4 {
              padding-bottom: 16px;
            }
            
            .pt-4 {
              padding-top: 16px;
            }
            
            .mt-2 {
              margin-top: 8px;
            }
            
            .mb-1 {
              margin-bottom: 4px;
            }
            
            .mb-2 {
              margin-bottom: 8px;
            }
            
            .pt-1 {
              padding-top: 4px;
            }
            
            .pb-1 {
              padding-bottom: 4px;
            }
            
            .ml-auto {
              margin-left: auto;
            }
            
            .w-24 {
              width: 96px;
            }
            
            .mt-6 {
              margin-top: 24px;
            }
            
            .object-contain {
              object-fit: contain;
            }
            
            .font-bold {
              font-weight: 700;
            }
            
            .font-semibold {
              font-weight: 600;
            }
            
            .font-medium {
              font-weight: 500;
            }
            
            .text-gray-900 {
              color: #111827;
            }
            
            .text-gray-700 {
              color: #374151;
            }
            
            .text-gray-600 {
              color: #4b5563;
            }
            
            .text-blue-900 {
              color: #1e3a8a;
            }
            
            .bg-gray-100 {
              background-color: #f3f4f6;
            }
            
                         /* Completely hide any browser-generated content including about:blank */
             body::before,
             body::after,
             *::before,
             *::after {
               content: none !important;
               display: none !important;
               visibility: hidden !important;
             }
             
             /* Hide any text content that might contain about:blank */
             body * {
               content: none !important;
             }
             
             /* Specific targeting for browser-generated content */
             body > *:not(.print-page) {
               display: none !important;
               visibility: hidden !important;
             }
            
            /* Hide any URL references or about:blank */
            a[href*="about:blank"],
            a[href="about:blank"],
            *[data-url*="about:blank"] {
              display: none !important;
              visibility: hidden !important;
            }
            
            
            
            /* Ensure clean print output */
            @page {
              margin: 0.5in;
              size: A4;
            }
            
            /* Hide browser headers and footers */
            @page :first {
              margin-top: 0.5in;
            }
            
            @page :left {
              margin-left: 0.5in;
            }
            
            @page :right {
              margin-right: 0.5in;
            }
          </style>
        </head>
                 <body>
           ${printPage.outerHTML}
          <script>
            // Wait for the page to load completely before printing
            window.onload = function() {
              setTimeout(function() {
                window.print();
                // Close the window after a delay to ensure print dialog has time to open
                setTimeout(function() {
                  window.close();
                }, 1000);
              }, 500);
            };
          </script>
        </body>
        </html>
      `;
      
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Fallback if onload doesn't work
      setTimeout(() => {
        if (!printWindow.closed) {
          printWindow.print();
          setTimeout(() => {
            if (!printWindow.closed) {
              printWindow.close();
            }
          }, 1000);
        }
      }, 1000);
    } else {
      // Fallback to regular print if new window fails
      window.print();
    }
  };

  if (!billData) return null;

  return (
    <>
      {/* Print Styles */}
      <style jsx>{`
        @media print {
          @page {
            margin: 0.5in;
            size: A4;
          }
          
          /* Hide everything except the bill content */
          body * {
            visibility: hidden !important;
          }
          
          body { 
            margin: 0; 
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            background: white !important;
          }
          
          /* Show only the print page content */
          .print-page,
          .print-page * {
            visibility: visible !important;
            display: block !important;
          }
          
          .print-page {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 20px !important;
            font-size: 12px;
            line-height: 1.4;
            background: white !important;
            color: black !important;
            z-index: 9999 !important;
          }
          
          /* Hide the no-print elements */
          .no-print {
            display: none !important;
            visibility: hidden !important;
          }
          
          .bill-header { 
            background: white !important;
            color: black !important;
            border-bottom: 2px solid #000 !important;
            margin-bottom: 20px !important;
            padding-bottom: 15px !important;
          }
          
          .bill-table {
            border-collapse: collapse;
            width: 100%;
            font-size: 10px;
            margin-bottom: 20px;
            page-break-inside: avoid;
          }
          
          .bill-table th,
          .bill-table td {
            border: 1px solid #000 !important;
            padding: 4px 6px;
            text-align: left;
            vertical-align: top;
          }
          
          .bill-table th {
            background-color: #f3f4f6 !important;
            color: black !important;
            font-weight: bold;
            text-align: center;
          }
          
          .bill-table tr:nth-child(even) {
            background-color: #f9fafb !important;
          }
          
          .section-title {
            font-size: 14px;
            font-weight: 700;
            margin-bottom: 8px;
            color: #000 !important;
            border-bottom: 2px solid #000 !important;
            padding-bottom: 4px;
            page-break-after: avoid;
          }
          
          .company-name {
            font-size: 18px;
            font-weight: 700;
            color: #000 !important;
          }
          
          .bill-title {
            font-size: 16px;
            font-weight: 700;
            color: #000 !important;
          }
          
          .detail-label {
            font-weight: 600;
            color: #000 !important;
          }
          
          .detail-value {
            font-weight: 500;
            color: #000 !important;
          }
          
          /* Ensure proper page breaks */
          .print-page > div {
            page-break-inside: avoid;
          }
          
          /* Financial summary styling for print */
          .bg-green-50 {
            background-color: #f0fdf4 !important;
            border: 1px solid #000 !important;
          }
          
          .bg-blue-50 {
            background-color: #eff6ff !important;
            border: 1px solid #000 !important;
          }
          
          .bg-gray-50 {
            background-color: #f9fafb !important;
            border: 1px solid #000 !important;
          }
          
          /* Footer styling */
          .border-t {
            border-top: 1px solid #000 !important;
          }
          
          /* Hide background colors and shadows in print */
          * {
            box-shadow: none !important;
          }
          
          /* Ensure text is readable */
          * {
            color: #000 !important;
          }
          
          /* Logo styling for print */
          img {
            max-width: 60px !important;
            height: auto !important;
          }
          
          /* Ensure proper spacing for print */
          .mb-4, .mb-6, .mb-8 {
            margin-bottom: 15px !important;
          }
          
          .mt-8 {
            margin-top: 20px !important;
          }
          
          .p-2, .p-3, .p-6 {
            padding: 8px !important;
          }
          
          /* Grid layout adjustments for print */
          .grid {
            display: grid !important;
          }
          
          .grid-cols-2 {
            grid-template-columns: 1fr 1fr !important;
          }
          
          /* Ensure currency formatting is clear */
          .text-green-600, .text-blue-600 {
            color: #000 !important;
            font-weight: bold !important;
          }
          
          /* Table responsive behavior for print */
          .overflow-x-auto {
            overflow: visible !important;
          }
          
          /* Hide browser-generated content and URLs */
          @page {
            margin: 0.5in;
            size: A4;
          }
          
                     /* Completely hide any browser-generated headers, footers, or URLs */
           body::before,
           body::after,
           *::before,
           *::after {
             content: none !important;
             display: none !important;
             visibility: hidden !important;
           }
           
           /* Hide any text content that might contain about:blank */
           body * {
             content: none !important;
           }
           
           /* Specific targeting for browser-generated content */
           body > *:not(.print-page) {
             display: none !important;
             visibility: hidden !important;
           }
          
          
          
          /* Hide any URL references or about:blank */
          a[href*="about:blank"],
          a[href="about:blank"],
          *[data-url*="about:blank"] {
            display: none !important;
            visibility: hidden !important;
          }
          
          /* Ensure no browser-generated content appears */
          @page :first {
            margin-top: 0.5in;
          }
          
          @page :left {
            margin-left: 0.5in;
          }
          
          @page :right {
            margin-right: 0.5in;
          }
        }
      `}</style>

             {/* Action Buttons */}
       <div className="no-print fixed top-20 right-4 z-50 flex space-x-3">
         <button
           onClick={handlePrint}
           className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-md flex items-center space-x-2"
         >
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
           </svg>
           <span>Print Bill</span>
         </button>
         <button
           onClick={onClose}
           className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-md flex items-center space-x-2"
         >
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
           </svg>
           <span>Close</span>
         </button>
       </div>

      {/* Bill Content */}
      <div className="print-page bg-white p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="bill-header mb-6 border-b border-gray-300 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="/MSGC.png" 
                alt="MSGC Logo" 
                className="w-12 h-12 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div>
                <h1 className="company-name text-gray-900 font-bold">MS Goods Carriers</h1>
              </div>
            </div>
            <div className="text-right">
              <h2 className="bill-title text-gray-900 font-bold">Monthly Bill</h2>
              <p className="text-sm text-gray-600">Generated: {new Date().toLocaleDateString('en-IN')}</p>
            </div>
          </div>
        </div>

        {/* Transporter Details */}
        <div className="mb-4">
          <h3 className="section-title text-gray-900 font-bold">Transporter Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="detail-label font-semibold">Name:</span>
                <span className="detail-value">{billData.transporter?.name || billData.transporterName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="detail-label font-semibold">Address:</span>
                <span className="detail-value">{billData.transporter?.address || 'N/A'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="detail-label font-semibold">Commission Rate:</span>
                <span className="detail-value">₹{billData.transporter?.commissionRate || billData.commissionRate} per kg</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="detail-label font-semibold">Contact:</span>
                <span className="detail-value">See below</span>
              </div>
            </div>
          </div>
          
          {/* Contact Details - Full Width */}
          <div className="mt-2 p-2 bg-gray-50 rounded border">
            <div className="text-sm">
              {formatContactInfo(billData.transporter?.contactInfo || billData.transporter?.phone).split('\n').map((line, index) => (
                <div key={index} className="flex justify-between items-center mb-1">
                  <span className="detail-label font-semibold">{line.split(':')[0]}:</span>
                  <span className="detail-value">{line.split(':')[1] || line}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bill Period */}
        <div className="mb-4 p-2 bg-blue-50 rounded border">
          <h3 className="section-title text-gray-900 font-bold">Bill Period</h3>
          <p className="text-lg font-bold text-blue-900">
            {getMonthName(billData.month)} {billData.year}
          </p>
          <p className="text-sm text-gray-600">
            {billData.startDate && billData.endDate ? 
              `${formatDate(billData.startDate)} to ${formatDate(billData.endDate)}` : 
              'Full month period'
            }
          </p>
        </div>

        {/* GR Details Table */}
        <div className="mb-4">
          <h3 className="section-title text-gray-900 font-bold">GR Details</h3>
          <div className="overflow-x-auto">
            <table className="bill-table w-full text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-2 font-bold">GR No.</th>
                  <th className="text-left p-2 font-bold">Date</th>
                  <th className="text-left p-2 font-bold">From</th>
                  <th className="text-left p-2 font-bold">To</th>
                  <th className="text-left p-2 font-bold">Weight</th>
                  <th className="text-left p-2 font-bold">PAID</th>
                  <th className="text-left p-2 font-bold">To Pay</th>
                  <th className="text-left p-2 font-bold">Commission</th>
                  <th className="text-left p-2 font-bold">Local Cartage</th>
                  <th className="text-left p-2 font-bold">Total Due</th>
                </tr>
              </thead>
              <tbody>
                {billData.bookings?.map((booking, index) => (
                  <tr key={booking.id || index} className="border-b border-gray-200">
                    <td className="p-2 font-medium">{booking.grNumber}</td>
                    <td className="p-2">{formatDate(booking.bookingDate)}</td>
                    <td className="p-2">{booking.fromLocation}</td>
                    <td className="p-2">{booking.toLocation}</td>
                    <td className="p-2">{formatWeight(booking.weightKg)}</td>
                                         <td className="p-2 text-center">
                       {booking.paidAmount && booking.paidAmount > 0 
                         ? formatCurrency(booking.paidAmount) 
                         : '-'
                       }
                     </td>
                                           <td className="p-2 font-semibold">
                        {booking.paidAmount && booking.paidAmount > 0 
                          ? '-'
                          : formatCurrency(booking.totalCharges || booking.totalDue)
                        }
                      </td>
                    <td className="p-2">{formatCurrency(booking.commissionAmount || (booking.weightKg * (billData.transporter?.commissionRate || billData.commissionRate)))}</td>
                    <td className="p-2">{formatCurrency(booking.localCartageCharges)}</td>
                                         <td className="p-2 font-semibold">{formatCurrency(booking.totalCharges || booking.totalDue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="mb-4 p-3 bg-green-50 rounded border">
          <h3 className="section-title text-gray-900 font-bold">Financial Summary</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-gray-700 mb-2 text-sm border-b border-gray-300 pb-1">Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between items-center">
                  <span className="detail-label font-semibold">Total Bookings:</span>
                  <span className="detail-value">{billData.summary?.totalBookings || billData.totalBookings || billData.bookings?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="detail-label font-semibold">Total Weight:</span>
                  <span className="detail-value">{formatWeight(billData.summary?.totalWeight || billData.totalWeight)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="detail-label font-semibold">Commission Rate:</span>
                  <span className="detail-value">₹{billData.transporter?.commissionRate || billData.commissionRate} per kg</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-gray-700 mb-2 text-sm border-b border-gray-300 pb-1">Financial Details</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between items-center">
                  <span className="detail-label font-semibold">Total Commission:</span>
                  <span className="detail-value text-green-600">{formatCurrency(billData.summary?.totalCommission || billData.commissionAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="detail-label font-semibold">Total Local Cartage:</span>
                  <span className="detail-value">{formatCurrency(billData.summary?.totalLocalCartage || billData.localCartageCharges)}</span>
                </div>
                <div className="flex justify-between items-center border-t border-gray-300 pt-1">
                  <span className="detail-label font-bold">Total Due:</span>
                  <span className="detail-value font-bold text-blue-600">{formatCurrency(billData.summary?.totalDue || billData.totalDue)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-gray-900 mb-2 text-sm">Terms & Conditions</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Payment is due within 30 days of bill generation</li>
                <li>• Late payments may incur additional charges</li>
                <li>• Commission is calculated based on actual weight transported</li>
                <li>• Local cartage charges are additional to commission</li>
              </ul>
            </div>
            <div className="text-right">
              <div className="mb-4">
                <p className="text-xs text-gray-600">Authorized Signature</p>
                <div className="mt-6 border-t border-gray-400 w-24 ml-auto"></div>
              </div>
              <div>
                <p className="text-xs text-gray-600">Date: _________________</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrintableBill; 