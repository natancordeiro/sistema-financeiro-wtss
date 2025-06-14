
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Home, List, AlertCircle } from 'lucide-react';
import Dashboard from '@/components/Dashboard';
import RecordsList from '@/components/RecordsList';
import RecordForm from '@/components/RecordForm';
import { useFinanceRecords, type FinanceRecord } from '@/hooks/useFinanceRecords';

const Index = () => {
  const { records, loading, addRecord, updateRecord, deleteRecord } = useFinanceRecords();
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FinanceRecord | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleSaveRecord = async (recordData: Omit<FinanceRecord, 'id' | 'criado_em'>) => {
    try {
      if (editingRecord) {
        await updateRecord(editingRecord.id, recordData);
      } else {
        await addRecord(recordData);
      }
      
      setShowForm(false);
      setEditingRecord(null);
    } catch (error) {
      // Error handling is done in the hook
      console.error('Error saving record:', error);
    }
  };

  const handleEditRecord = (record: FinanceRecord) => {
    setEditingRecord(record);
    setShowForm(true);
  };

  const handleDeleteRecord = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este registro?')) {
      try {
        await deleteRecord(id);
      } catch (error) {
        // Error handling is done in the hook
        console.error('Error deleting record:', error);
      }
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingRecord(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados financeiros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Financeiro Familiar</h1>
                <p className="text-xs text-gray-600">Controle suas finanças</p>
              </div>
            </div>
            
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Registro
            </Button>
          </div>
        </div>
      </header>

      {/* Informação sobre dados */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {records.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  Nenhum registro encontrado
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Comece adicionando seu primeiro registro financeiro clicando no botão "Novo Registro".
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-green-800">
                  Dados conectados com sucesso!
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  Mostrando {records.length} registro(s) do seu banco de dados Supabase.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="records" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              Registros
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard 
              records={records}
              selectedPeriod={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
            />
          </TabsContent>

          <TabsContent value="records">
            <RecordsList 
              records={records}
              onEdit={handleEditRecord}
              onDelete={handleDeleteRecord}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Modal do Formulário */}
      {showForm && (
        <RecordForm
          record={editingRecord}
          onSave={handleSaveRecord}
          onCancel={handleCancelForm}
        />
      )}
    </div>
  );
};

export default Index;
