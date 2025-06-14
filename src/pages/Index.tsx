
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Home, List, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Dashboard from '@/components/Dashboard';
import RecordsList from '@/components/RecordsList';
import RecordForm from '@/components/RecordForm';

interface FinanceRecord {
  id: number;
  data_hora: string;
  responsavel: string;
  categoria: string;
  tipo: 'gasto' | 'receita';
  valor: number;
  descricao: string;
  criado_em: string;
}

const Index = () => {
  const [records, setRecords] = useState<FinanceRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FinanceRecord | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // Dados de exemplo para demonstração
  const sampleRecords: FinanceRecord[] = [
    {
      id: 1,
      data_hora: '2024-06-10T14:30:00Z',
      responsavel: 'João',
      categoria: 'Alimentação',
      tipo: 'gasto',
      valor: 150.50,
      descricao: 'Compras no supermercado',
      criado_em: '2024-06-10T14:30:00Z'
    },
    {
      id: 2,
      data_hora: '2024-06-09T09:00:00Z',
      responsavel: 'Maria',
      categoria: 'Salário',
      tipo: 'receita',
      valor: 3500.00,
      descricao: 'Salário mensal',
      criado_em: '2024-06-09T09:00:00Z'
    },
    {
      id: 3,
      data_hora: '2024-06-08T16:45:00Z',
      responsavel: 'João',
      categoria: 'Transporte',
      tipo: 'gasto',
      valor: 25.00,
      descricao: 'Uber para o trabalho',
      criado_em: '2024-06-08T16:45:00Z'
    },
    {
      id: 4,
      data_hora: '2024-06-07T19:30:00Z',
      responsavel: 'Maria',
      categoria: 'Lazer',
      tipo: 'gasto',
      valor: 80.00,
      descricao: 'Cinema com a família',
      criado_em: '2024-06-07T19:30:00Z'
    },
    {
      id: 5,
      data_hora: '2024-06-06T10:15:00Z',
      responsavel: 'Pedro',
      categoria: 'Freelance',
      tipo: 'receita',
      valor: 450.00,
      descricao: 'Projeto de design',
      criado_em: '2024-06-06T10:15:00Z'
    }
  ];

  useEffect(() => {
    // Simula carregamento dos dados
    setTimeout(() => {
      setRecords(sampleRecords);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSaveRecord = async (recordData: Omit<FinanceRecord, 'id' | 'criado_em'>) => {
    try {
      if (editingRecord) {
        // Atualizar registro existente
        const updatedRecord = {
          ...editingRecord,
          ...recordData
        };
        setRecords(prev => prev.map(r => r.id === editingRecord.id ? updatedRecord : r));
        toast({
          title: "Registro atualizado!",
          description: "O registro foi atualizado com sucesso.",
        });
      } else {
        // Criar novo registro
        const newRecord: FinanceRecord = {
          ...recordData,
          id: Math.max(...records.map(r => r.id), 0) + 1,
          criado_em: new Date().toISOString()
        };
        setRecords(prev => [newRecord, ...prev]);
        toast({
          title: "Registro criado!",
          description: "O novo registro foi adicionado com sucesso.",
        });
      }
      
      setShowForm(false);
      setEditingRecord(null);
    } catch (error) {
      toast({
        title: "Erro!",
        description: "Não foi possível salvar o registro. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleEditRecord = (record: FinanceRecord) => {
    setEditingRecord(record);
    setShowForm(true);
  };

  const handleDeleteRecord = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este registro?')) {
      try {
        setRecords(prev => prev.filter(r => r.id !== id));
        toast({
          title: "Registro excluído!",
          description: "O registro foi removido com sucesso.",
        });
      } catch (error) {
        toast({
          title: "Erro!",
          description: "Não foi possível excluir o registro. Tente novamente.",
          variant: "destructive"
        });
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

      {/* Aviso sobre Supabase */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">
                Conecte ao Supabase para funcionalidade completa
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                Esta aplicação está usando dados de exemplo. Para conectar ao banco de dados real, 
                clique no botão verde "Supabase" no canto superior direito e configure sua integração.
              </p>
            </div>
          </div>
        </div>
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
