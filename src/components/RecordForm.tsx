
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Save, X, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

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

interface RecordFormProps {
  record?: FinanceRecord | null;
  onSave: (record: Omit<FinanceRecord, 'id' | 'criado_em'>) => void;
  onCancel: () => void;
}

const RecordForm: React.FC<RecordFormProps> = ({ record, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    data_hora: '',
    responsavel: '',
    categoria: '',
    tipo: 'gasto' as 'gasto' | 'receita',
    valor: '',
    descricao: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Categorias pré-definidas para facilitar o uso
  const predefinedCategories = {
    gasto: [
      'Alimentação',
      'Transporte',
      'Moradia',
      'Saúde',
      'Educação',
      'Lazer',
      'Vestuário',
      'Serviços',
      'Impostos',
      'Outros'
    ],
    receita: [
      'Salário',
      'Freelance',
      'Investimentos',
      'Vendas',
      'Benefícios',
      'Outros'
    ]
  };

  const predefinedResponsibles = [
    'João',
    'Maria',
    'Pedro',
    'Ana',
    'Carlos',
    'Lucia'
  ];

  useEffect(() => {
    if (record) {
      setFormData({
        data_hora: format(new Date(record.data_hora), "yyyy-MM-dd'T'HH:mm"),
        responsavel: record.responsavel,
        categoria: record.categoria,
        tipo: record.tipo,
        valor: record.valor.toString(),
        descricao: record.descricao || ''
      });
    } else {
      // Valores padrão para novo registro
      const now = new Date();
      setFormData(prev => ({
        ...prev,
        data_hora: format(now, "yyyy-MM-dd'T'HH:mm")
      }));
    }
  }, [record]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.data_hora) {
      newErrors.data_hora = 'Data e hora são obrigatórios';
    }

    if (!formData.responsavel.trim()) {
      newErrors.responsavel = 'Responsável é obrigatório';
    }

    if (!formData.categoria.trim()) {
      newErrors.categoria = 'Categoria é obrigatória';
    }

    if (!formData.valor.trim()) {
      newErrors.valor = 'Valor é obrigatório';
    } else {
      const numericValue = parseFloat(formData.valor.replace(',', '.'));
      if (isNaN(numericValue) || numericValue <= 0) {
        newErrors.valor = 'Valor deve ser um número positivo';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const recordData = {
      data_hora: new Date(formData.data_hora).toISOString(),
      responsavel: formData.responsavel.trim(),
      categoria: formData.categoria.trim(),
      tipo: formData.tipo,
      valor: parseFloat(formData.valor.replace(',', '.')),
      descricao: formData.descricao.trim()
    };

    onSave(recordData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatCurrency = (value: string) => {
    // Remove tudo que não é dígito
    const numericValue = value.replace(/\D/g, '');
    
    if (!numericValue) return '';
    
    // Converte para número e formata
    const floatValue = parseFloat(numericValue) / 100;
    return floatValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleValueChange = (value: string) => {
    const formatted = formatCurrency(value);
    handleInputChange('valor', formatted);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            {record ? 'Editar Registro' : 'Novo Registro'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Data e Hora */}
              <div className="space-y-2">
                <Label htmlFor="data_hora">Data e Hora *</Label>
                <Input
                  id="data_hora"
                  type="datetime-local"
                  value={formData.data_hora}
                  onChange={(e) => handleInputChange('data_hora', e.target.value)}
                  className={errors.data_hora ? 'border-red-500' : ''}
                />
                {errors.data_hora && (
                  <p className="text-sm text-red-500">{errors.data_hora}</p>
                )}
              </div>

              {/* Tipo */}
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo *</Label>
                <Select value={formData.tipo} onValueChange={(value: 'gasto' | 'receita') => handleInputChange('tipo', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receita">Receita</SelectItem>
                    <SelectItem value="gasto">Gasto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Responsável */}
              <div className="space-y-2">
                <Label htmlFor="responsavel">Responsável *</Label>
                <div className="flex gap-2">
                  <Input
                    id="responsavel"
                    value={formData.responsavel}
                    onChange={(e) => handleInputChange('responsavel', e.target.value)}
                    placeholder="Digite o nome"
                    className={errors.responsavel ? 'border-red-500' : ''}
                  />
                  <Select onValueChange={(value) => handleInputChange('responsavel', value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="..." />
                    </SelectTrigger>
                    <SelectContent>
                      {predefinedResponsibles.map((responsible) => (
                        <SelectItem key={responsible} value={responsible}>
                          {responsible}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {errors.responsavel && (
                  <p className="text-sm text-red-500">{errors.responsavel}</p>
                )}
              </div>

              {/* Categoria */}
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria *</Label>
                <div className="flex gap-2">
                  <Input
                    id="categoria"
                    value={formData.categoria}
                    onChange={(e) => handleInputChange('categoria', e.target.value)}
                    placeholder="Digite a categoria"
                    className={errors.categoria ? 'border-red-500' : ''}
                  />
                  <Select onValueChange={(value) => handleInputChange('categoria', value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="..." />
                    </SelectTrigger>
                    <SelectContent>
                      {predefinedCategories[formData.tipo].map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {errors.categoria && (
                  <p className="text-sm text-red-500">{errors.categoria}</p>
                )}
              </div>
            </div>

            {/* Valor */}
            <div className="space-y-2">
              <Label htmlFor="valor">Valor (R$) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="valor"
                  value={formData.valor}
                  onChange={(e) => handleValueChange(e.target.value)}
                  placeholder="0,00"
                  className={`pl-10 ${errors.valor ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.valor && (
                <p className="text-sm text-red-500">{errors.valor}</p>
              )}
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => handleInputChange('descricao', e.target.value)}
                placeholder="Detalhes sobre o registro (opcional)"
                rows={3}
              />
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                {record ? 'Atualizar' : 'Salvar'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecordForm;
