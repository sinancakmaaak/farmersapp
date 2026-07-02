import React, { useEffect, useState } from 'react';
import { SoilTest, SoilTestResult, Field } from '../types';
import {
  getAllSoilTests,
  createSoilTest,
  updateSoilTest,
  deleteSoilTest,
  getAllSoilTestResults,
  createSoilTestResult,
  updateSoilTestResult,
  deleteSoilTestResult,
} from '../services/soilTestService';
import { getAllFields } from '../services/fieldService';
import { Button } from '../components/ui/button';
import { PageHeader } from '../components/PageHeader';

const SoilTests: React.FC = () => {
  // SoilTest state
  const [soilTests, setSoilTests] = useState<SoilTest[]>([]);
  const [soilTestLoading, setSoilTestLoading] = useState(true);
  const [soilTestError, setSoilTestError] = useState<string | null>(null);
  const [soilTestModalOpen, setSoilTestModalOpen] = useState(false);
  const [selectedSoilTest, setSelectedSoilTest] = useState<SoilTest | null>(null);
  const [soilTestForm, setSoilTestForm] = useState<Partial<SoilTest>>({ sampleCode: '', sampleDate: '', notes: '', fieldId: undefined });

  // Fields state
  const [fields, setFields] = useState<Field[]>([]);

  // SoilTestResult state
  const [soilTestResults, setSoilTestResults] = useState<SoilTestResult[]>([]);
  const [soilTestResultLoading, setSoilTestResultLoading] = useState(true);
  const [soilTestResultError, setSoilTestResultError] = useState<string | null>(null);
  const [soilTestResultModalOpen, setSoilTestResultModalOpen] = useState(false);
  const [selectedSoilTestResult, setSelectedSoilTestResult] = useState<SoilTestResult | null>(null);
  const [soilTestResultForm, setSoilTestResultForm] = useState<Partial<SoilTestResult>>({ parameter: '', value: 0, unit: '', soilTestId: undefined });

  useEffect(() => {
    loadSoilTests();
    loadSoilTestResults();
    loadFields();
  }, []);

  const loadFields = async () => {
    try {
      const data = await getAllFields();
      setFields(data);
    } catch (err) {
      console.error('Tarlalar yüklenirken hata oluştu:', err);
    }
  };

  const loadSoilTests = async () => {
    setSoilTestLoading(true);
    try {
      const data = await getAllSoilTests();
      setSoilTests(data);
      setSoilTestError(null);
    } catch (err) {
      setSoilTestError('Toprak testleri yüklenirken hata oluştu.');
    } finally {
      setSoilTestLoading(false);
    }
  };

  const loadSoilTestResults = async () => {
    setSoilTestResultLoading(true);
    try {
      const data = await getAllSoilTestResults();
      setSoilTestResults(data);
      setSoilTestResultError(null);
    } catch (err) {
      setSoilTestResultError('Toprak test sonuçları yüklenirken hata oluştu.');
    } finally {
      setSoilTestResultLoading(false);
    }
  };

  // SoilTest handlers
  const handleSoilTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedSoilTest) {
        await updateSoilTest(selectedSoilTest.id, soilTestForm);
      } else {
        await createSoilTest(soilTestForm);
      }
      setSoilTestModalOpen(false);
      setSelectedSoilTest(null);
      setSoilTestForm({ sampleCode: '', sampleDate: '', notes: '', fieldId: undefined });
      loadSoilTests();
    } catch (err) {
      setSoilTestError('Kayıt işlemi sırasında hata oluştu.');
    }
  };

  const handleSoilTestEdit = (test: SoilTest) => {
    setSelectedSoilTest(test);
    setSoilTestForm(test);
    setSoilTestModalOpen(true);
  };

  const handleSoilTestDelete = async (id: number) => {
    if (window.confirm('Bu toprak testini silmek istediğinizden emin misiniz?')) {
      await deleteSoilTest(id);
      loadSoilTests();
    }
  };

  // SoilTestResult handlers
  const handleSoilTestResultSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedSoilTestResult) {
        await updateSoilTestResult(selectedSoilTestResult.id, soilTestResultForm);
      } else {
        await createSoilTestResult(soilTestResultForm);
      }
      setSoilTestResultModalOpen(false);
      setSelectedSoilTestResult(null);
      setSoilTestResultForm({ parameter: '', value: 0, unit: '', soilTestId: undefined });
      loadSoilTestResults();
    } catch (err) {
      setSoilTestResultError('Kayıt işlemi sırasında hata oluştu.');
    }
  };

  const handleSoilTestResultEdit = (result: SoilTestResult) => {
    setSelectedSoilTestResult(result);
    setSoilTestResultForm(result);
    setSoilTestResultModalOpen(true);
  };

  const handleSoilTestResultDelete = async (id: number) => {
    if (window.confirm('Bu test sonucunu silmek istediğinizden emin misiniz?')) {
      await deleteSoilTestResult(id);
      loadSoilTestResults();
    }
  };

  return (
    <div className="space-y-10">
      <PageHeader
        title="Toprak Testleri ve Sonuçları"
        description="Tüm toprak testlerinizi ve sonuçlarını yönetin"
      />
      {/* Soil Tests Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Toprak Testleri</h2>
          <Button 
            onClick={() => { 
              setSoilTestModalOpen(true); 
              setSelectedSoilTest(null); 
              setSoilTestForm({ sampleCode: '', sampleDate: '', notes: '', fieldId: undefined }); 
            }}
            className="btn-primary"
          >
            Yeni Test
          </Button>
        </div>
        {soilTestError && <div className="text-red-600 mb-2">{soilTestError}</div>}
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Tarla
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Numune Kodu
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Numune Tarihi
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Notlar
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">İşlemler</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {soilTestLoading ? (
                    <tr><td colSpan={5} className="text-center py-4 text-sm text-gray-500">Yükleniyor...</td></tr>
                  ) : soilTests.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-4 text-sm text-gray-500">Kayıt yok</td></tr>
                  ) : soilTests.map((test) => {
                    const field = fields.find(f => f.id === test.fieldId);
                    return (
                      <tr key={test.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{field ? field.name : 'Belirtilmemiş'}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{test.sampleCode}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{test.sampleDate}</td>
                        <td className="px-3 py-4 text-sm text-gray-500">{test.notes}</td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button className="text-green-600 hover:text-green-900 mr-4" onClick={() => handleSoilTestEdit(test)}>Düzenle</button>
                          <button className="text-red-600 hover:text-red-900" onClick={() => handleSoilTestDelete(test.id)}>Sil</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {/* Soil Test Results Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Toprak Test Sonuçları</h2>
          <Button 
            onClick={() => { 
              setSoilTestResultModalOpen(true); 
              setSelectedSoilTestResult(null); 
              setSoilTestResultForm({ parameter: '', value: 0, unit: '', soilTestId: undefined }); 
            }}
            className="btn-primary"
          >
            Yeni Sonuç
          </Button>
        </div>
        {soilTestResultError && <div className="text-red-600 mb-2">{soilTestResultError}</div>}
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Tarla
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Numune Kodu
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Parametre
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Değer
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Birim
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">İşlemler</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {soilTestResultLoading ? (
                    <tr><td colSpan={6} className="text-center py-4 text-sm text-gray-500">Yükleniyor...</td></tr>
                  ) : soilTestResults.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-4 text-sm text-gray-500">Kayıt yok</td></tr>
                  ) : soilTestResults.map((result) => {
                    const test = soilTests.find(t => t.id === result.soilTestId);
                    const field = test ? fields.find(f => f.id === test.fieldId) : null;
                    return (
                      <tr key={result.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{field ? field.name : 'Belirtilmemiş'}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{result.sampleCode}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{result.parameter}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{result.value}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{result.unit}</td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button className="text-green-600 hover:text-green-900 mr-4" onClick={() => handleSoilTestResultEdit(result)}>Düzenle</button>
                          <button className="text-red-600 hover:text-red-900" onClick={() => handleSoilTestResultDelete(result.id)}>Sil</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {/* SoilTest Modal */}
      {soilTestModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <form onSubmit={handleSoilTestSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tarla</label>
                    <select 
                      value={soilTestForm.fieldId || ''} 
                      onChange={e => setSoilTestForm(f => ({ ...f, fieldId: Number(e.target.value) }))} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    >
                      <option value="">Seçiniz</option>
                      {fields.map(field => (
                        <option key={field.id} value={field.id}>{field.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Numune Kodu</label>
                    <input
                      type="text"
                      value={soilTestForm.sampleCode}
                      onChange={e => setSoilTestForm(f => ({ ...f, sampleCode: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Numune Tarihi</label>
                    <input
                      type="date"
                      value={soilTestForm.sampleDate}
                      onChange={e => setSoilTestForm(f => ({ ...f, sampleDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notlar</label>
                    <textarea
                      value={soilTestForm.notes || ''}
                      onChange={e => setSoilTestForm(f => ({ ...f, notes: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setSoilTestModalOpen(false); setSelectedSoilTest(null); }}
                    className="w-full py-2 text-base"
                  >
                    İptal
                  </Button>
                  <Button
                    type="submit"
                    className="w-full py-2 text-base bg-green-600 hover:bg-green-700 focus:ring-green-500"
                  >
                    {selectedSoilTest ? 'Güncelle' : 'Kaydet'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* SoilTestResult Modal */}
      {soilTestResultModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <form onSubmit={handleSoilTestResultSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Test</label>
                    <select
                      value={soilTestResultForm.soilTestId || ''}
                      onChange={e => setSoilTestResultForm(f => ({ ...f, soilTestId: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    >
                      <option value="">Test seçiniz</option>
                      {soilTests.map(test => {
                        const field = fields.find(f => f.id === test.fieldId);
                        return (
                          <option key={test.id} value={test.id}>
                            {field ? `${field.name} - ` : ''}{test.sampleCode} ({test.sampleDate})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Parametre</label>
                    <input
                      type="text"
                      value={soilTestResultForm.parameter}
                      onChange={e => setSoilTestResultForm(f => ({ ...f, parameter: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Değer</label>
                    <input
                      type="number"
                      value={soilTestResultForm.value}
                      onChange={e => setSoilTestResultForm(f => ({ ...f, value: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Birim</label>
                    <input
                      type="text"
                      value={soilTestResultForm.unit}
                      onChange={e => setSoilTestResultForm(f => ({ ...f, unit: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setSoilTestResultModalOpen(false); setSelectedSoilTestResult(null); }}
                    className="w-full py-2 text-base"
                  >
                    İptal
                  </Button>
                  <Button
                    type="submit"
                    className="w-full py-2 text-base bg-green-600 hover:bg-green-700 focus:ring-green-500"
                  >
                    {selectedSoilTestResult ? 'Güncelle' : 'Kaydet'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SoilTests; 