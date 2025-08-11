import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ExpensesHeader from './ExpensesHeader';
import ExpensesStats from './ExpensesStats';
import ExpensesFilters from './ExpensesFilters';
import ExpensesTable from './ExpensesTable';
import ExpenseModal from './ExpenseModal';
import ExpenseDeleteModal from './ExpenseDeleteModal';

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deletingExpense, setDeletingExpense] = useState(null);
  const [filters, setFilters] = useState({
    searchTerm: '',
    expenseType: 'all',
    vehicleId: 'all',
    dateRange: 'all',
    minAmount: '',
    maxAmount: ''
  });
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [expensesRes, vehiclesRes] = await Promise.all([
        axios.get('/api/expenses'),
        axios.get('/api/vehicles')
      ]);
      setExpenses(expensesRes.data);
      setVehicles(vehiclesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingExpense) {
        await axios.put(`/api/expenses/${editingExpense.id}`, formData);
      } else {
        await axios.post('/api/expenses', formData);
      }
      
      setShowModal(false);
      setEditingExpense(null);
      fetchData();
    } catch (error) {
      console.error('Error saving expense:', error);
      throw error;
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setShowModal(true);
  };

  const handleDelete = (expense) => {
    setDeletingExpense(expense);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/expenses/${deletingExpense.id}`);
      setShowDeleteModal(false);
      setDeletingExpense(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const openModal = () => {
    setEditingExpense(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingExpense(null);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingExpense(null);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const filterAndSortExpenses = () => {
    let filtered = expenses.filter(expense => {
      const matchesSearch = 
        expense.description?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        expense.expenseType.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (expense.vehicle?.vehicleNumber && expense.vehicle.vehicleNumber.toLowerCase().includes(filters.searchTerm.toLowerCase()));
      
      const matchesType = filters.expenseType === 'all' || expense.expenseType === filters.expenseType;
      const matchesVehicle = filters.vehicleId === 'all' || expense.vehicleId === filters.vehicleId;
      
      const matchesAmount = 
        (!filters.minAmount || expense.amount >= parseFloat(filters.minAmount)) &&
        (!filters.maxAmount || expense.amount <= parseFloat(filters.maxAmount));
      
      let matchesDate = true;
      if (filters.dateRange !== 'all') {
        const expenseDate = new Date(expense.date);
        const now = new Date();
        
        switch (filters.dateRange) {
          case 'today':
            matchesDate = expenseDate.toDateString() === now.toDateString();
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDate = expenseDate >= weekAgo;
            break;
          case 'month':
            matchesDate = expenseDate.getMonth() === now.getMonth() && 
                        expenseDate.getFullYear() === now.getFullYear();
            break;
          case 'quarter':
            const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
            matchesDate = expenseDate >= quarterStart;
            break;
          case 'year':
            matchesDate = expenseDate.getFullYear() === now.getFullYear();
            break;
        }
      }
      
      return matchesSearch && matchesType && matchesVehicle && matchesAmount && matchesDate;
    });

    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'date') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else if (sortBy === 'amount') {
        aVal = parseFloat(aVal);
        bVal = parseFloat(bVal);
      }
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  const filteredExpenses = filterAndSortExpenses();
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedExpenses = filteredExpenses.slice(startIndex, startIndex + itemsPerPage);

  const stats = {
    total: expenses.reduce((sum, expense) => sum + expense.amount, 0),
    thisMonth: expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        const now = new Date();
        return expenseDate.getMonth() === now.getMonth() && 
               expenseDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, expense) => sum + expense.amount, 0),
    fuel: expenses
      .filter(expense => expense.expenseType === 'fuel')
      .reduce((sum, expense) => sum + expense.amount, 0),
    maintenance: expenses
      .filter(expense => expense.expenseType === 'maintenance')
      .reduce((sum, expense) => sum + expense.amount, 0),
    toll: expenses
      .filter(expense => expense.expenseType === 'toll')
      .reduce((sum, expense) => sum + expense.amount, 0),
    count: expenses.length
  };

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <ExpensesHeader onAddExpense={openModal} />
        
        <ExpensesStats stats={stats} />
        
        <ExpensesFilters 
          filters={filters}
          setFilters={setFilters}
          vehicles={vehicles}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />
        
        <ExpensesTable 
          expenses={paginatedExpenses}
          onEdit={handleEdit}
          onDelete={handleDelete}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          startIndex={startIndex}
          totalItems={filteredExpenses.length}
          itemsPerPage={itemsPerPage}
        />
        
        {showModal && (
          <ExpenseModal
            expense={editingExpense}
            vehicles={vehicles}
            onSubmit={handleSubmit}
            onClose={closeModal}
          />
        )}
        
        {showDeleteModal && (
          <ExpenseDeleteModal
            expense={deletingExpense}
            onConfirm={confirmDelete}
            onClose={closeDeleteModal}
          />
        )}
      </div>
    </div>
  );
};

export default ExpensesPage; 