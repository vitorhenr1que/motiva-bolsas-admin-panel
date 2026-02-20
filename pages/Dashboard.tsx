
import React, { useEffect, useState, useCallback } from 'react';
import {
  Users,
  CreditCard,
  UserPlus,
  RefreshCcw,
  AlertCircle,
  Clock,
  TrendingUp,
  CalendarDays,
  MapPin,
  Search,
  RotateCcw
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { SummaryResponse, CourseStat, CoursesResponse } from '../types';
import { KpiCard } from '../components/KpiCard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<SummaryResponse | null>(null);
  const [novosStats, setNovosStats] = useState<CoursesResponse | null>(null);
  const [renovadosStats, setRenovadosStats] = useState<CoursesResponse | null>(null);

  const [filters, setFilters] = useState({ uf: '', city: '', course: '' });
  const [availableCourses, setAvailableCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setLoadingCourses(true);
      setError(null);

      // 1. Busca resumo geral com filtros de UF, Cidade e Curso
      const summary = await adminApi.getSummary({ search: '', ...filters });
      setData(summary);
      setLoading(false);

      // 2. Busca dados de cursos
      const [novosRes, renovadosRes] = await Promise.all([
        adminApi.getCoursesNovos(filters),
        adminApi.getCoursesRenovados(filters)
      ]);

      // Ordenação Alfabética por nome do curso
      const sortAlphabetically = (res: CoursesResponse) => ({
        ...res,
        courses: [...(res.courses || [])].sort((a, b) =>
          a.course.localeCompare(b.course, 'pt-BR', { sensitivity: 'base' })
        )
      });

      const sortedNovos = sortAlphabetically(novosRes);
      setNovosStats(sortedNovos);
      setRenovadosStats(sortAlphabetically(renovadosRes));

      // Atualiza a lista de cursos disponíveis se ainda não estiver preenchida
      if (availableCourses.length === 0 && sortedNovos.courses.length > 0) {
        setAvailableCourses(sortedNovos.courses.map(c => c.course));
      }
    } catch (err: any) {
      console.error("Erro ao carregar dashboard:", err);
      setError(err.message || "Erro ao carregar dados do painel");
    } finally {
      setLoading(false);
      setLoadingCourses(false);
    }
  }, [filters, availableCourses.length]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const chartData = data ? [
    { name: 'Novos', value: data.totals.novosAlunos, color: '#3b82f6' },
    { name: 'Renovados', value: data.totals.renovados, color: '#10b981' },
    { name: 'Pendente (Renov)', value: data.totals.renovadosPendentes, color: '#f59e0b' },
    { name: 'Pendente (Novos)', value: data.totals.novosPendentes, color: '#ef4444' },
  ] : [];

  const CourseStatsList = ({
    title,
    icon: Icon,
    color,
    stats,
    total,
    isLoading
  }: {
    title: string,
    icon: any,
    color: string,
    stats: CourseStat[],
    total?: number,
    isLoading: boolean
  }) => {
    // Calcula o valor máximo da lista para manter a proporção das barras mesmo com ordenação alfabética
    const maxVal = stats.length > 0 ? Math.max(...stats.map(s => s.total)) : 1;

    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Icon size={20} className={`text-${color}-600`} />
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          </div>
          {!isLoading && total !== undefined && (
            <span className={`px-2 py-1 bg-${color}-50 text-${color}-700 rounded-md text-xs font-bold`}>
              {total} Alunos
            </span>
          )}
        </div>
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {isLoading ? (
            [1, 2, 3, 4, 5].map(i => <div key={i} className="h-12 bg-slate-50 animate-pulse rounded-lg w-full" />)
          ) : stats && stats.length > 0 ? (
            stats.map((item, idx) => {
              const percentage = (item.total / maxVal) * 100;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700 truncate pr-4" title={item.course}>
                      {item.course}
                    </span>
                    <span className="font-bold text-slate-900">{item.total}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full bg-${color}-500 transition-all duration-1000`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-slate-400 text-center py-4">Sem dados para os filtros selecionados.</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Cabeçalho e Filtros Rápidos */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Dashboard Executivo</h1>
          <p className="text-xs text-slate-500">Acompanhamento de metas e conversões</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="UF"
              maxLength={2}
              className="w-20 pl-9 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs uppercase focus:ring-2 focus:ring-blue-500/20 outline-none"
              value={filters.uf}
              onChange={(e) => setFilters(prev => ({ ...prev, uf: e.target.value.toUpperCase() }))}
            />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Filtrar por Cidade"
              className="w-48 pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
              value={filters.city}
              onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
            />
          </div>
          <div className="relative">
            <select
              className="w-48 pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 outline-none appearance-none cursor-pointer"
              value={filters.course}
              onChange={(e) => setFilters(prev => ({ ...prev, course: e.target.value }))}
            >
              <option value="">Filtrar por Curso</option>
              {availableCourses.map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setFilters({ uf: '', city: '', course: '' })}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Limpar Filtros"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {error ? (
        <div className="p-8 text-center bg-red-50 border border-red-100 rounded-xl">
          <AlertCircle className="mx-auto text-red-500 mb-2" size={32} />
          <h3 className="text-red-800 font-bold">Falha na conexão</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
          >
            Tentar carregar novamente
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <KpiCard
              label="Total de Usuários"
              value={data?.totals.totalUsers || 0}
              icon={<Users size={20} />}
              color="bg-slate-500"
              loading={loading}
            />
            <KpiCard
              label="Pagamentos Confirmados"
              value={data?.totals.totalPaid || 0}
              icon={<CreditCard size={20} />}
              color="bg-green-500"
              loading={loading}
            />
            <KpiCard
              label="Novos Alunos"
              value={data?.totals.novosAlunos || 0}
              icon={<UserPlus size={20} />}
              color="bg-blue-500"
              loading={loading}
            />
            <KpiCard
              label="Alunos Renovados"
              value={data?.totals.renovados || 0}
              icon={<RefreshCcw size={20} />}
              color="bg-emerald-500"
              loading={loading}
            />
            <KpiCard
              label="Renovações Pendentes"
              value={data?.totals.renovadosPendentes || 0}
              icon={<Clock size={20} />}
              color="bg-amber-500"
              loading={loading}
            />
            <KpiCard
              label="Novos Pendentes"
              value={data?.totals.novosPendentes || 0}
              icon={<AlertCircle size={20} />}
              color="bg-rose-500"
              loading={loading}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CourseStatsList
              title="Novos Alunos por Curso"
              icon={UserPlus}
              color="blue"
              stats={novosStats?.courses || []}
              total={novosStats?.totalAlunos}
              isLoading={loadingCourses}
            />

            <CourseStatsList
              title="Renovados por Curso"
              icon={RefreshCcw}
              color="emerald"
              stats={renovadosStats?.courses || []}
              total={renovadosStats?.totalAlunos}
              isLoading={loadingCourses}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <TrendingUp size={20} className="text-blue-600" />
                  <h3 className="text-lg font-bold text-slate-800">Status Geral do Funil</h3>
                </div>
                {data?.rules.novosPendentesWindow && (
                  <div className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 font-mono">
                    WINDOW: {new Date(data.rules.novosPendentesWindow.start).toLocaleDateString()} - {new Date(data.rules.novosPendentesWindow.end).toLocaleDateString()}
                  </div>
                )}
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                    <Tooltip
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Métricas de Performance</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-xs font-medium text-slate-700">Taxa de Conversão de Pagos</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    {data && data.totals.totalUsers > 0 ? ((data.totals.totalPaid / data.totals.totalUsers) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-xs font-medium text-slate-700">Participação de Novos Alunos</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    {data && data.totals.totalUsers > 0 ? ((data.totals.novosAlunos / data.totals.totalUsers) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span className="text-xs font-medium text-slate-700">Taxa de Pendência Geral</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    {data && data.totals.totalUsers > 0 ? (((data.totals.novosPendentes + data.totals.renovadosPendentes) / data.totals.totalUsers) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Sistema Atualizado</div>
                <div className="text-xs font-semibold text-slate-600">{new Date().toLocaleTimeString('pt-BR')}</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
