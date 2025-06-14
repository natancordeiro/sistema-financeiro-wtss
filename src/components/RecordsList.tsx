
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Download, Edit, Trash2, Filter, Search } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

interface RecordsListProps {
  records: FinanceRecord[];
  onEdit: (record: FinanceRecord) => void;
  onDelete: (id: number) => void;
}

const RecordsList: React.FC<RecordsListProps> = ({ records, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterResponsible, setFilterResponsible] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  // Obter valores únicos para os filtros
  const uniqueResponsibles = useMemo(() => 
    [...new Set(records.map(r => r.responsavel))].sort(), [records]);
  
  const uniqueCategories = useMemo(() => 
    [...new Set(records.map(r => r.categoria))].sort(), [records]);

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const matchesSearch = searchTerm === '' || 
        record.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.responsavel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.categoria.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === 'all' || record.tipo === filterType;
      const matchesResponsible = filterResponsible === 'all' || record.responsavel === filterResponsible;
      const matchesCategory = filterCategory === 'all' || record.categoria === filterCategory;

      const recordDate = new Date(record.data_hora);
      const matchesDateFrom = !dateFrom || recordDate >= new Date(dateFrom);
      const matchesDateTo = !dateTo || recordDate <= new Date(dateTo + 'T23:59:59');

      return matchesSearch && matchesType && matchesResponsible && matchesCategory && matchesDateFrom && matchesDateTo;
    }).sort((a, b) => new Date(b.data_hora).getTime() - new Date(a.data_hora).getTime());
  }, [records, searchTerm, filterType, filterResponsible, filterCategory, dateFrom, dateTo]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
  };

  const exportToCSV = () => {
    const headers = ['Data', 'Responsável', 'Categoria', 'Tipo', 'Valor', 'Descrição'];
    const csvContent = [
      headers.join(','),
      ...filteredRecords.map(record => [
        format(new Date(record.data_hora), 'dd/MM/yyyy HH:mm'),
        record.responsavel,
        record.categoria,
        record.tipo,
        record.valor.toString().replace('.', ','),
        `"${record.descricao || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `registros_financeiros_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterResponsible('all');
    setFilterCategory('all');
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Registros Financeiros</h1>
          <p className="text-gray-600">
            {filteredRecords.length} de {records.length} registros
          </p>
        </div>
        <Button onClick={exportToCSV} className="bg-success hover:bg-success/90">
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por descrição, responsável..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="receita">Receitas</SelectItem>
                <SelectItem value="gasto">Gastos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterResponsible} onValueChange={setFilterResponsible}>
              <SelectTrigger>
                <SelectValue placeholder="Responsável" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {uniqueResponsibles.map((responsible) => (
                  <SelectItem key={responsible} value={responsible}>
                    {responsible}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {uniqueCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de início
              </label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data final
              </label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de registros */}
      <div className="space-y-4">
        {filteredRecords.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum registro encontrado
                </h3>
                <p className="text-gray-600">
                  Tente ajustar os filtros ou adicione novos registros.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredRecords.map((record) => (
            <Card key={record.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant={record.tipo === 'receita' ? 'default' : 'destructive'}>
                        {record.tipo}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {formatDate(record.data_hora)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Responsável:</span>
                        <p className="font-medium">{record.responsavel}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Categoria:</span>
                        <p className="font-medium">{record.categoria}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Valor:</span>
                        <p className={`font-bold text-lg ${record.tipo === 'receita' ? 'text-success' : 'text-danger'}`}>
                          {formatCurrency(record.valor)}
                        </p>
                      </div>
                    </div>
                    
                    {record.descricao && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Descrição:</span>
                        <p className="text-gray-800">{record.descricao}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(record)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(record.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default RecordsList;
