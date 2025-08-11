# Transport Management App - File Structure

## 📁 Project Structure

```
client/src/
├── components/                 # Reusable UI components
│   ├── layout/               # Layout components
│   │   ├── Layout.jsx       # Main layout wrapper
│   │   ├── Header.jsx       # Top navigation header
│   │   └── Sidebar.jsx      # Left navigation sidebar
│   │
│   ├── common/              # Shared/common components
│   │   ├── Pagination.jsx   # Pagination component
│   │   └── PerPageSelector.jsx # Items per page selector
│   │
│   ├── dashboard/           # Dashboard specific components
│   │   ├── DashboardHome.jsx
│   │   ├── DashboardHeader.jsx
│   │   ├── DashboardOverview.jsx
│   │   ├── DashboardQuickActions.jsx
│   │   ├── DashboardRecentActivity.jsx
│   │   └── billing/        # Billing sub-components
│   │       ├── BillingPage.jsx
│   │       ├── BillingHeader.jsx
│   │       ├── BillingStats.jsx
│   │       ├── BillingCalculator.jsx
│   │       └── BillGenerator.jsx
│   │
│   ├── bookings/            # Booking management
│   │   ├── BookingsListPage.jsx
│   │   ├── CreateBookingPage.jsx
│   │   ├── EditBookingPage.jsx
│   │   └── ViewBookingPage.jsx
│   │
│   ├── customers/           # Customer management
│   │   ├── CustomersListPage.jsx
│   │   ├── CreateCustomerPage.jsx
│   │   ├── EditCustomerPage.jsx
│   │   └── ViewCustomerPage.jsx
│   │
│   ├── transporters/        # Transporter management
│   │   ├── TransportersListPage.jsx
│   │   ├── CreateTransporterPage.jsx
│   │   ├── EditTransporterPage.jsx
│   │   └── ViewTransporterPage.jsx
│   │
│   ├── vehicles/           # Vehicle management
│   │   ├── VehiclesListPage.jsx
│   │   ├── CreateVehiclePage.jsx
│   │   ├── EditVehiclePage.jsx
│   │   └── ViewVehiclePage.jsx
│   │
│   ├── drivers/            # Driver management
│   │   ├── DriversListPage.jsx
│   │   ├── CreateDriverPage.jsx
│   │   ├── EditDriverPage.jsx
│   │   └── ViewDriverPage.jsx
│   │
│   └── expenses/           # Expense management
│       ├── ExpensesPage.jsx
│       ├── ExpensesHeader.jsx
│       ├── ExpensesStats.jsx
│       ├── ExpensesFilters.jsx
│       ├── ExpensesTable.jsx
│       ├── ExpenseModal.jsx
│       └── ExpenseDeleteModal.jsx
│
├── pages/                  # Page-level components
│   ├── DashboardPage.jsx
│   ├── BookingsPage.jsx
│   ├── CustomersPage.jsx
│   ├── TransportersPage.jsx
│   ├── VehiclesPage.jsx
│   ├── DriversPage.jsx
│   ├── ExpensesPage.jsx
│   └── BillingPage.jsx
│
├── utils/                  # Utility functions
│   ├── formatters.js       # Data formatting utilities
│   └── api.js             # API service functions
│
├── context/               # React Context providers
│   └── AuthContext.jsx
│
├── styles/               # CSS/SCSS files
│   └── index.css
│
├── App.jsx              # Main app component
├── main.jsx             # App entry point
└── README.md            # This file
```

## 🏗️ Architecture Principles

### 1. **Separation of Concerns**
- **Layout Components**: Handle overall page structure
- **Page Components**: Route-level components
- **Feature Components**: Business logic specific components
- **Common Components**: Reusable UI elements

### 2. **Modular Design**
- Each feature has its own directory
- Components are grouped by functionality
- Clear import/export structure

### 3. **Scalability**
- Easy to add new features
- Consistent patterns across modules
- Reusable components and utilities

## 📋 Component Categories

### **Layout Components** (`/components/layout/`)
- **Layout.jsx**: Main layout wrapper with sidebar and header
- **Header.jsx**: Top navigation with user info and actions
- **Sidebar.jsx**: Left navigation with menu items

### **Common Components** (`/components/common/`)
- **Pagination.jsx**: Reusable pagination component
- **PerPageSelector.jsx**: Items per page selector
- **LoadingSpinner.jsx**: Loading state component
- **ErrorBoundary.jsx**: Error handling component

### **Feature Components** (`/components/[feature]/`)
Each feature follows the same pattern:
- **ListPage.jsx**: Main listing page with filters and table
- **CreatePage.jsx**: Form to create new items
- **EditPage.jsx**: Form to edit existing items
- **ViewPage.jsx**: Detailed view of an item

### **Page Components** (`/pages/`)
- Route-level components that import feature components
- Handle routing and layout integration
- Minimal business logic

## 🛠️ Utility Functions

### **Formatters** (`/utils/formatters.js`)
- `formatCurrency()`: Indian Rupee formatting
- `formatDate()`: Date formatting
- `formatNumber()`: Number formatting
- `getStatusColor()`: Status badge colors
- `getRevenueColor()`: Revenue display colors

### **API Service** (`/utils/api.js`)
- Centralized API configuration
- Request/response interceptors
- Entity-specific API functions
- Error handling

## 🎯 Benefits of This Structure

### **1. Maintainability**
- Clear separation of concerns
- Easy to locate and modify components
- Consistent patterns across features

### **2. Scalability**
- Easy to add new features
- Modular design allows independent development
- Reusable components reduce duplication

### **3. Developer Experience**
- Intuitive file organization
- Clear import paths
- Consistent naming conventions

### **4. Performance**
- Code splitting by feature
- Lazy loading capabilities
- Optimized bundle sizes

## 🔄 Migration Guide

### **Moving Existing Components**
1. **Dashboard Components**: Already modularized
2. **List Pages**: Move to respective feature directories
3. **Form Pages**: Move to respective feature directories
4. **Common Components**: Move to `/components/common/`

### **Updating Imports**
- Update all import paths to reflect new structure
- Use relative imports within feature directories
- Use absolute imports for common components

### **Adding New Features**
1. Create feature directory in `/components/`
2. Add page component in `/pages/`
3. Update routing in `App.jsx`
4. Add navigation item in `Sidebar.jsx`

## 📝 Best Practices

### **File Naming**
- Use PascalCase for components
- Use camelCase for utilities
- Use descriptive names

### **Component Structure**
- One component per file
- Export as default
- Include PropTypes for type checking

### **Import Organization**
```javascript
// React imports
import React from 'react';

// Third-party imports
import { Link } from 'react-router-dom';
import axios from 'axios';

// Local imports
import { formatCurrency } from '../../utils/formatters';
import Pagination from '../common/Pagination';
```

### **State Management**
- Use React hooks for local state
- Use Context for global state
- Keep state as close to usage as possible

This structure provides a solid foundation for a scalable, maintainable transport management application. 