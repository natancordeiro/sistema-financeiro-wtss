
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

interface DashboardProps {
  records: FinanceRecord[];
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ records, selectedPeriod, onPeriodChange }) => {
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const periodOptions = [
    { value: 'current-month', label: 'Mês Atual' },
    { value: 'last-month', label: 'Mês Passado' },
    { value: 'current-year', label: 'Ano Atual' },
    { value: 'all', label: 'Todos os Períodos' }
  ];

  const filteredRecords = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return records.filter(record => {
      const recordDate = new Date(record.data_hora);
      
      switch (selectedPeriod) {
        case 'current-month':
          return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
        case 'last-month':
          const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
          return recordDate.getMonth() === lastMonth && recordDate.getFullYear() === lastMonthYear;
        case 'current-year':
          return recordDate.getFullYear() === currentYear;
        default:
          return true;
      }
    });
  }, [records, selectedPeriod]);

  const summary = useMemo(() => {
    const receitas = filteredRecords.filter(r => r.tipo === 'receita').reduce((sum, r) => sum + r.valor, 0);
    const gastos = filteredRecords.filter(r => r.tipo === 'gasto').reduce((sum, r) => sum + r.valor, 0);
    const saldo = receitas - gastos;

    return { receitas, gastos, saldo };
  }, [filteredRecords]);

  const categoryData = useMemo(() => {
    const categoryTotals = filteredRecords.reduce((acc, record) => {
      const key = `${record.categoria}_${record.tipo}`;
      if (!acc[key]) {
        acc[key] = { name: record.categoria, value: 0, tipo: record.tipo };
      }
      acc[key].value += record.valor;
      return acc;
    }, {} as Record<string, { name: string; value: number; tipo: string }>);

    return Object.values(categoryTotals).sort((a, b) => b.value - a.value);
  }, [filteredRecords]);

  const responsibleData = useMemo(() => {
    const responsibleTotals = filteredRecords.reduce((acc, record) => {
      if (!acc[record.responsavel]) {
        acc[record.responsavel] = { name: record.responsavel, receitas: 0, gastos: 0 };
      }
      if (record.tipo === 'receita') {
        acc[record.responsavel].receitas += record.valor;
      } else {
        acc[record.responsavel].gastos += record.valor;
      }
      return acc;
    }, {} as Record<string, { name: string; receitas: number; gastos: number }>);

    return Object.values(responsibleTotals);
  }, [filteredRecords]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header com seletor de período */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Financeiro</h1>
          <p className="text-gray-600">Visão geral das suas finanças familiares</p>
        </div>
        <div className="flex gap-2">
          {periodOptions.map((option) => (
            <Button
              key={option.value}
              variant={selectedPeriod === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => onPeriodChange(option.value)}
              className="text-xs"
            >
              <Calendar className="w-3 h-3 mr-1" />
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-success hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{formatCurrency(summary.receitas)}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-danger hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Gastos</CardTitle>
            <TrendingDown className="h-4 w-4 text-danger" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-danger">{formatCurrency(summary.gastos)}</div>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${summary.saldo >= 0 ? 'border-l-success' : 'border-l-danger'} hover:shadow-lg transition-shadow`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Saldo</CardTitle>
            <DollarSign className={`h-4 w-4 ${summary.saldo >= 0 ? 'text-success' : 'text-danger'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.saldo >= 0 ? 'text-success' : 'text-danger'}`}>
              {formatCurrency(summary.saldo)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Pizza - Categorias */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Gastos por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData.filter(d => d.tipo === 'gasto')}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.filter(d => d.tipo === 'gasto').map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de Barras - Por Responsável */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Receitas vs Gastos por Responsável</CardTitle>
          </CardHeader>
          <CardContent>
            {responsibleData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={responsibleData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `R$ ${value}`} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="receitas" fill="#10b981" name="Receitas" />
                  <Bar dataKey="gastos" fill="#ef4444" name="Gastos" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resumo por categorias */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle>Resumo por Categorias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryData.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="font-medium">{category.name}</span>
                  <Badge variant={category.tipo === 'receita' ? 'default' : 'destructive'}>
                    {category.tipo}
                  </Badge>
                </div>
                <span className={`font-bold ${category.tipo === 'receita' ? 'text-success' : 'text-danger'}`}>
                  {formatCurrency(category.value)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
