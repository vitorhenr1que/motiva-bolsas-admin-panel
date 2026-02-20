
import React, { useEffect, useState, useCallback } from 'react';
import { adminApi } from '../services/adminApi';
import { User, UserListType, UsersResponse } from '../types';
import { FiltersBar, FilterState } from '../components/FiltersBar';
import { UsersTable } from '../components/UsersTable';
import { Pagination } from '../components/Pagination';
import { AlertCircle } from 'lucide-react';

interface UsersListProps {
  type: UserListType;
  title: string;
}

const INITIAL_FILTERS: FilterState = {
  search: '',
  uf: '',
  city: '',
  dateFrom: '',
  dateTo: '',
  course: '',
};

export const UsersList: React.FC<UsersListProps> = ({ type, title }) => {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [page, setPage] = useState(0);
  const [data, setData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableCourses, setAvailableCourses] = useState<string[]>([]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const endpoint = type === UserListType.GENERAL ? '/users/general' : `/users/${type}`;

      const response = await adminApi.getUsers(endpoint, {
        ...filters,
        page,
        onlyPaid: (type === UserListType.GENERAL || type.includes('pendente')) ? false : undefined,
      });

      if (Array.isArray(response)) {
        setData({
          users: response,
          total: response.length,
          pages: 1
        });
      } else if (response && response.users) {
        setData({
          users: response.users,
          total: response.total || (response as any).totalItems || response.users.length,
          pages: response.pages || (response as any).totalPages || 1
        });
      } else if (response && (response as any).data && Array.isArray((response as any).data)) {
        setData({
          users: (response as any).data,
          total: (response as any).total || (response as any).totalItems || (response as any).data.length,
          pages: (response as any).pages || (response as any).totalPages || 1
        });
      } else {
        setData({ users: [], total: 0, pages: 0 });
      }
    } catch (err: any) {
      console.error(`Erro ao buscar ${type}:`, err);
      setError(err.message || "Erro ao carregar lista de usuários");
      setData({ users: [], total: 0, pages: 0 });
    } finally {
      setLoading(false);
    }
  }, [type, filters, page]);

  // Fetch available courses for the filter
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        let response;
        const courseFilters = { uf: filters.uf, city: filters.city };

        if (type === UserListType.RENOVADOS || type === UserListType.RENOVADOS_PENDENTES) {
          response = await adminApi.getCoursesRenovados(courseFilters);
        } else {
          // Default to Novos for general or other types
          response = await adminApi.getCoursesNovos(courseFilters);
        }

        if (response && response.courses) {
          const courseNames = response.courses
            .map(c => c.course)
            .sort((a, b) => a.localeCompare(b, 'pt-BR'));
          setAvailableCourses(courseNames);
        }
      } catch (err) {
        console.error("Erro ao buscar cursos para filtro:", err);
      }
    };

    fetchCourses();
  }, [type, filters.uf, filters.city]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(0);
  };

  const handleReset = () => {
    setFilters(INITIAL_FILTERS);
    setPage(0);
  };

  const handleExport = () => {
    if (!data?.users.length) return;

    const headers = ["ID", "Nome", "Email", "CPF", "Telefone", "Cidade", "UF", "Curso", "Status Pagamento", "Criado em"];
    const csvRows = data.users.map(u => [
      u.id,
      `"${u.name}"`,
      u.email,
      u.cpf,
      u.phone,
      u.addresses?.[0]?.city || "",
      u.addresses?.[0]?.uf || "",
      `"${u.course || ""}"`,
      u.currentPayment ? "Pago" : "Pendente",
      u.createdAt
    ].join(','));

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_${type}_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {data && data.total > 0 && (
          <div className="text-sm text-slate-500">
            Total: <span className="font-bold text-slate-900">{data.total}</span> registros
          </div>
        )}
      </div>

      <FiltersBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
        onExport={handleExport}
        courses={availableCourses}
      />

      {error ? (
        <div className="bg-red-50 border border-red-200 p-6 rounded-xl text-center">
          <AlertCircle className="mx-auto text-red-500 mb-2" size={24} />
          <p className="text-red-800 font-medium">{error}</p>
          <button
            onClick={() => fetchUsers()}
            className="mt-3 text-sm font-semibold text-red-600 hover:text-red-800 underline"
          >
            Tentar carregar novamente
          </button>
        </div>
      ) : (
        <>
          <UsersTable
            users={data?.users || []}
            loading={loading}
          />

          {data && (
            <Pagination
              currentPage={page}
              totalPages={data.pages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
};
