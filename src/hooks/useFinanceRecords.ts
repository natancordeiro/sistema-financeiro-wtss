
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface FinanceRecord {
  id: number;
  data_hora: string;
  responsavel: string;
  categoria: string;
  tipo: 'gasto' | 'receita';
  valor: number;
  descricao: string;
  criado_em: string;
}

export const useFinanceRecords = () => {
  const [records, setRecords] = useState<FinanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      console.log('Fetching records from Supabase...');
      
      const { data, error } = await supabase
        .from('financeiro_registros')
        .select('*')
        .order('criado_em', { ascending: false });

      if (error) {
        console.error('Error fetching records:', error);
        throw error;
      }

      console.log('Records fetched:', data);
      setRecords(data || []);
    } catch (error) {
      console.error('Error in fetchRecords:', error);
      toast({
        title: "Erro!",
        description: "Não foi possível carregar os registros. Verifique sua conexão.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addRecord = async (recordData: Omit<FinanceRecord, 'id' | 'criado_em'>) => {
    try {
      console.log('Adding record:', recordData);
      
      const { data, error } = await supabase
        .from('financeiro_registros')
        .insert([recordData])
        .select()
        .single();

      if (error) {
        console.error('Error adding record:', error);
        throw error;
      }

      console.log('Record added:', data);
      setRecords(prev => [data, ...prev]);
      
      toast({
        title: "Registro criado!",
        description: "O novo registro foi adicionado com sucesso.",
      });

      return data;
    } catch (error) {
      console.error('Error in addRecord:', error);
      toast({
        title: "Erro!",
        description: "Não foi possível salvar o registro. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateRecord = async (id: number, recordData: Partial<FinanceRecord>) => {
    try {
      console.log('Updating record:', id, recordData);
      
      const { data, error } = await supabase
        .from('financeiro_registros')
        .update(recordData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating record:', error);
        throw error;
      }

      console.log('Record updated:', data);
      setRecords(prev => prev.map(r => r.id === id ? data : r));
      
      toast({
        title: "Registro atualizado!",
        description: "O registro foi atualizado com sucesso.",
      });

      return data;
    } catch (error) {
      console.error('Error in updateRecord:', error);
      toast({
        title: "Erro!",
        description: "Não foi possível atualizar o registro. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteRecord = async (id: number) => {
    try {
      console.log('Deleting record:', id);
      
      const { error } = await supabase
        .from('financeiro_registros')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting record:', error);
        throw error;
      }

      console.log('Record deleted:', id);
      setRecords(prev => prev.filter(r => r.id !== id));
      
      toast({
        title: "Registro excluído!",
        description: "O registro foi removido com sucesso.",
      });
    } catch (error) {
      console.error('Error in deleteRecord:', error);
      toast({
        title: "Erro!",
        description: "Não foi possível excluir o registro. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return {
    records,
    loading,
    addRecord,
    updateRecord,
    deleteRecord,
    refetch: fetchRecords
  };
};
