
import { SummaryResponse, UsersResponse, CoursesResponse } from '../types';

const BASE_URL = "https://www.motivabolsas.com.br/api/admin";
const SECRET_KEY = import.meta.env.VITE_SECRET_KEY;

export async function postAdmin<T>(path: string, body: any): Promise<T> {
  try {
    // Garante que o caminho esteja formatado corretamente
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const url = `${BASE_URL}${cleanPath}`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        ...body,
        secret_key: SECRET_KEY,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Erro na API: ${res.status}`);
    }

    return res.json();
  } catch (error: any) {
    console.error(`Falha na requisição [${path}]:`, error);

    // Tratamento específico para o erro "Failed to fetch" (CORS ou rede)
    if (error.message === 'Failed to fetch') {
      throw new Error("Erro de conexão: Verifique se o endpoint está correto ou se há bloqueio de CORS.");
    }

    throw error;
  }
}

export const adminApi = {
  // Alterado de /summary para /users/summary para seguir o padrão da API
  getSummary: (filters: {
    search?: string;
    uf?: string;
    city?: string;
    course?: string;
  }) => postAdmin<SummaryResponse>('/users/summary', filters),

  getUsers: (path: string, filters: {
    page: number;
    search?: string;
    course?: string;
    dateFrom?: string;
    dateTo?: string;
    uf?: string;
    city?: string;
    onlyPaid?: boolean;
  }) => postAdmin<UsersResponse>(path, filters),

  getCoursesNovos: (filters: { uf?: string; city?: string }) =>
    postAdmin<CoursesResponse>('/courses/novos', filters),

  getCoursesRenovados: (filters: { uf?: string; city?: string }) =>
    postAdmin<CoursesResponse>('/courses/renovados', filters),
};
