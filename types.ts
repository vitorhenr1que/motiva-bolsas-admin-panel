
export type Address = {
  id: string;
  street: string;
  number: string;
  complement?: string | null;
  neighborhood: string;
  uf: string;
  city: string;
  cep: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  customerId: string;
  birthDate?: string | null;
  createdAt: string;
  currentPayment: boolean;
  renovacao?: number | null;
  course?: string | null;
  discount?: string | null;
  instituition?: string | null;
  addresses: Address[];
};

export type AuthUser = {
  id: string;
  name: string;
  role: string;
  email: string;
};

export type SummaryTotals = {
  totalUsers: number;
  totalPaid: number;
  novosAlunos: number;
  renovados: number;
  renovadosPendentes: number;
  novosPendentes: number;
};

export type SummaryRules = {
  novosPendentesWindow: {
    start: string;
    end: string;
  };
};

export type SummaryResponse = {
  totals: SummaryTotals;
  rules: SummaryRules;
};

export type UsersResponse = {
  users: User[];
  total: number;
  pages: number;
};

export type CourseStat = {
  course: string;
  total: number;
};

export type CoursesResponse = {
  totalAlunos: number;
  courses: CourseStat[];
};

export enum UserListType {
  GENERAL = 'general',
  NOVOS = 'novos',
  RENOVADOS = 'renovados',
  RENOVADOS_PENDENTES = 'renovados-pendentes',
  NOVOS_PENDENTES = 'novos-pendentes'
}
