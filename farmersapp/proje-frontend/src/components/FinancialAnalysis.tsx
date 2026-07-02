import React, { useEffect, useState } from 'react';
import api from '../api';
import { PageHeader } from './PageHeader';
import { Button } from './ui/button';

interface ExpenseData {
  id: number;
  type: string;
  amount: number;
  supplier_company_id?: number;
  notes?: string;
}

interface RevenueData {
  id: number;
  type: string;
  amount: number;
  description?: string;
}

interface Employee {
  id: number;
  fullName: string;
  position: string;
  salary: number;
}

interface FinancialData {
  expenses: ExpenseData[];
  revenues: RevenueData[];
  employees: Employee[];
}

const FinancialAnalysis: React.FC = () => {
  const [financialData, setFinancialData] = useState<FinancialData>({
    expenses: [],
    revenues: [],
    employees: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [revenueModalOpen, setRevenueModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [selectedRevenue, setSelectedRevenue] = useState<RevenueData | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseData | null>(null);

  // Form states
  const [revenueForm, setRevenueForm] = useState<Partial<RevenueData>>({
    type: '',
    amount: 0,
    description: ''
  });
  const [expenseForm, setExpenseForm] = useState<Partial<ExpenseData>>({
    type: '',
    amount: 0,
    notes: '',
    supplier_company_id: undefined
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [expensesResponse, revenuesResponse, employeesResponse] = await Promise.all([
        api.get('/api/expenses'),
        api.get('/api/revenues'),
        api.get('/api/employees')
      ]);

      setFinancialData({
        expenses: expensesResponse.data,
        revenues: revenuesResponse.data,
        employees: employeesResponse.data
      });
      setLoading(false);
    } catch (err) {
      setError('Veri yüklenirken bir hata oluştu.');
      setLoading(false);
    }
  };

  const handleRevenueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedRevenue) {
        await api.put(`/api/revenues/${selectedRevenue.id}`, revenueForm);
      } else {
        await api.post('/api/revenues', revenueForm);
      }
      setRevenueModalOpen(false);
      setSelectedRevenue(null);
      setRevenueForm({ type: '', amount: 0, description: '' });
      fetchData();
    } catch (err) {
      setError('Gelir kaydı işlemi sırasında hata oluştu.');
    }
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Veri yapısını backend'in beklediği formata dönüştürme
      const expenseData = {
        type: expenseForm.type,
        amount: Number(expenseForm.amount),
        notes: expenseForm.notes || null,
        supplier_company_id: null // Şimdilik null gönderelim
      };

      console.log('Gönderilen veri:', expenseData);

      if (selectedExpense) {
        await api.put(`/api/expenses/${selectedExpense.id}`, expenseData);
      } else {
        const response = await api.post('/api/expenses', expenseData);
        console.log('Sunucu yanıtı:', response);
      }
      
      setExpenseModalOpen(false);
      setSelectedExpense(null);
      setExpenseForm({ type: '', amount: 0, notes: '', supplier_company_id: undefined });
      fetchData();
    } catch (err: any) {
      console.error('Gider ekleme hatası:', err);
      console.error('Hata detayı:', err.response?.data);
      setError(
        `Gider kaydı işlemi sırasında hata oluştu: ${
          err.response?.data?.error || err.response?.data?.type || err.message || 'Bilinmeyen hata'
        }`
      );
    }
  };

  const handleRevenueEdit = (revenue: RevenueData) => {
    setSelectedRevenue(revenue);
    setRevenueForm(revenue);
    setRevenueModalOpen(true);
  };

  const handleExpenseEdit = (expense: ExpenseData) => {
    setSelectedExpense(expense);
    setExpenseForm({
      type: expense.type,
      amount: expense.amount,
      notes: expense.notes,
      supplier_company_id: expense.supplier_company_id
    });
    setExpenseModalOpen(true);
  };

  const handleRevenueDelete = async (id: number) => {
    if (window.confirm('Bu gelir kaydını silmek istediğinizden emin misiniz?')) {
      try {
        await api.delete(`/api/revenues/${id}`);
        fetchData();
      } catch (err) {
        setError('Gelir kaydı silinirken hata oluştu.');
      }
    }
  };

  const handleExpenseDelete = async (id: number) => {
    if (window.confirm('Bu gider kaydını silmek istediğinizden emin misiniz?')) {
      try {
        await api.delete(`/api/expenses/${id}`);
        fetchData();
      } catch (err) {
        setError('Gider kaydı silinirken hata oluştu.');
      }
    }
  };

  // Toplam maaş giderini hesapla
  const totalSalaryExpense = financialData.employees.reduce((total, employee) => total + employee.salary, 0);

  // Diğer giderlerin toplamını hesapla
  const totalOtherExpenses = financialData.expenses.reduce((total, expense) => total + expense.amount, 0);

  // Toplam gideri hesapla (maaşlar + diğer giderler)
  const totalExpenses = totalSalaryExpense + totalOtherExpenses;

  // Toplam geliri hesapla
  const totalRevenues = financialData.revenues.reduce((total, revenue) => total + revenue.amount, 0);

  // Net kazancı hesapla
  const netIncome = totalRevenues - totalExpenses;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8 bg-gray-50 min-h-screen">
      <PageHeader
        title="Finansal Analiz"
        description="Gelir ve giderlerinizi takip edin"
      />

      {/* Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2 text-center">Toplam Gelir</h3>
          <p className="text-3xl font-bold text-green-600 text-center">
            {totalRevenues.toLocaleString('tr-TR')} ₺
          </p>
        </div>
        <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2 text-center">Toplam Gider</h3>
          <p className="text-3xl font-bold text-red-600 text-center">
            {totalExpenses.toLocaleString('tr-TR')} ₺
          </p>
        </div>
        <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2 text-center">Net Kazanç</h3>
          <p className={`text-3xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'} text-center`}>
            {netIncome.toLocaleString('tr-TR')} ₺
          </p>
        </div>
      </div>

      {/* Detaylı Tablolar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gelirler Tablosu */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Gelirler</h2>
              <Button
                onClick={() => {
                  setRevenueModalOpen(true);
                  setSelectedRevenue(null);
                  setRevenueForm({ type: '', amount: 0, description: '' });
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Yeni Gelir Ekle
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tür</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Açıklama</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">İşlemler</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {financialData.revenues.map((revenue) => (
                  <tr key={revenue.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{revenue.type}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{revenue.description || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600">
                      {revenue.amount.toLocaleString('tr-TR')} ₺
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleRevenueEdit(revenue)}
                        className="text-green-600 hover:text-green-900 mr-4"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleRevenueDelete(revenue.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Giderler Tablosu */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Giderler</h2>
              <Button
                onClick={() => {
                  setExpenseModalOpen(true);
                  setSelectedExpense(null);
                  setExpenseForm({ type: '', amount: 0, notes: '', supplier_company_id: undefined });
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Yeni Gider Ekle
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tür</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Not</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">İşlemler</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Maaş Giderleri */}
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Personel Maaşları</td>
                  <td className="px-6 py-4 text-sm text-gray-500">Toplam {financialData.employees.length} çalışan</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-red-600">
                    {totalSalaryExpense.toLocaleString('tr-TR')} ₺
                  </td>
                  <td></td>
                </tr>
                {/* Diğer Giderler */}
                {financialData.expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.type}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{expense.notes || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-red-600">
                      {expense.amount.toLocaleString('tr-TR')} ₺
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleExpenseEdit(expense)}
                        className="text-green-600 hover:text-green-900 mr-4"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleExpenseDelete(expense.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Toplam Gider</td>
                  <td></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-red-600">
                    {totalExpenses.toLocaleString('tr-TR')} ₺
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Gelir Modal */}
      {revenueModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {selectedRevenue ? 'Gelir Düzenle' : 'Yeni Gelir Ekle'}
            </h2>
            <form onSubmit={handleRevenueSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tür</label>
                <input
                  type="text"
                  value={revenueForm.type}
                  onChange={(e) => setRevenueForm({ ...revenueForm, type: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tutar</label>
                <input
                  type="number"
                  value={revenueForm.amount}
                  onChange={(e) => setRevenueForm({ ...revenueForm, amount: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Açıklama</label>
                <textarea
                  value={revenueForm.description}
                  onChange={(e) => setRevenueForm({ ...revenueForm, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  onClick={() => {
                    setRevenueModalOpen(false);
                    setSelectedRevenue(null);
                    setRevenueForm({ type: '', amount: 0, description: '' });
                  }}
                  className="btn-secondary"
                >
                  İptal
                </Button>
                <Button type="submit" className="btn-primary">
                  {selectedRevenue ? 'Güncelle' : 'Kaydet'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gider Modal */}
      {expenseModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {selectedExpense ? 'Gider Düzenle' : 'Yeni Gider Ekle'}
            </h2>
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative">
                {error}
              </div>
            )}
            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tür</label>
                <input
                  type="text"
                  value={expenseForm.type}
                  onChange={(e) => setExpenseForm({ ...expenseForm, type: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tutar</label>
                <input
                  type="number"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Not (Opsiyonel)</label>
                <textarea
                  value={expenseForm.notes}
                  onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  placeholder="Gider hakkında ek bilgi..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  onClick={() => {
                    setExpenseModalOpen(false);
                    setSelectedExpense(null);
                    setExpenseForm({ type: '', amount: 0, notes: '', supplier_company_id: undefined });
                    setError(null);
                  }}
                  className="btn-secondary"
                >
                  İptal
                </Button>
                <Button type="submit" className="btn-primary">
                  {selectedExpense ? 'Güncelle' : 'Kaydet'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialAnalysis; 