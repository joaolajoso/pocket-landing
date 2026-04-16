export interface QATestDefinition {
  id: string;
  category: string;
  name: string;
  description: string;
  destructive?: boolean;
}

export interface QATestResult {
  id: string;
  testId: string;
  testName: string;
  category: string;
  status: 'pass' | 'fail' | 'error' | 'warning';
  message: string;
  duration: number;
  timestamp: string;
  details?: string;
}

export const QA_EMAILS = [
  'joaolajoso@ua.pt',
  'joaopedrolajoso@hotmail.com',
  'joaopedrolajoso@gmail.com'
];

export const testDefinitions: QATestDefinition[] = [
  // Users (setup)
  { id: 'create-personal-users', category: 'Utilizadores', name: 'Criar contas pessoais', description: 'Cria test1, test2, test3 com conta pessoal' },
  { id: 'create-business-user', category: 'Utilizadores', name: 'Criar conta business', description: 'Cria utilizador business com organização automática' },
  { id: 'get-test-users', category: 'Utilizadores', name: 'Listar contas teste', description: 'Lista todas as contas @pocketcv.test' },

  // Onboarding
  { id: 'onboarding-personal', category: 'Onboarding', name: 'Onboarding pessoal', description: 'Verifica fluxo de registo pessoal completo' },
  { id: 'onboarding-business', category: 'Onboarding', name: 'Onboarding business', description: 'Verifica fluxo de registo business com criação de organização' },
  
  // Profile
  { id: 'setup-public-profile', category: 'Perfil Público', name: 'Criar perfil público', description: 'Configura slug, bio e headline num utilizador teste' },
  { id: 'create-user-links', category: 'Perfil Público', name: 'Criar links', description: 'Adiciona links (LinkedIn, website, email) a um utilizador teste' },
  { id: 'verify-public-page', category: 'Perfil Público', name: 'Verificar página pública', description: 'Verifica se a página pública do utilizador carrega' },

  // Company
  { id: 'create-org-website', category: 'Empresa', name: 'Criar página empresa', description: 'Cria website da organização para utilizador business' },
  { id: 'verify-company-page', category: 'Empresa', name: 'Verificar página empresa', description: 'Verifica se a página da empresa carrega via /c/subdomain' },

  // Events
  { id: 'create-test-event', category: 'Eventos', name: 'Criar evento', description: 'Cria um evento de teste público' },
  { id: 'register-event', category: 'Eventos', name: 'Inscrever em evento', description: 'Inscreve utilizadores teste num evento' },
  { id: 'verify-event-page', category: 'Eventos', name: 'Verificar página evento', description: 'Verifica se a página do evento carrega' },

  // Networking
  { id: 'create-connections', category: 'Networking', name: 'Criar conexões', description: 'Cria conexões entre utilizadores teste' },
  { id: 'create-contacts', category: 'Networking', name: 'Adicionar contactos', description: 'Submete contactos na lista de networking' },

  // Backend API
  { id: 'api-profiles', category: 'Backend API', name: 'API Profiles', description: 'Testa leitura de perfis via Supabase' },
  { id: 'api-links', category: 'Backend API', name: 'API Links', description: 'Testa leitura de links do utilizador' },
  { id: 'api-events', category: 'Backend API', name: 'API Eventos', description: 'Testa leitura de eventos via Supabase' },
  { id: 'api-connections', category: 'Backend API', name: 'API Conexões', description: 'Testa leitura de conexões do utilizador' },

  // Cleanup (always last)
  { id: 'cleanup-test-data', category: 'Limpeza', name: 'Limpar dados teste', description: 'Remove todas as contas e dados de teste', destructive: true },
];

export const categories = [...new Set(testDefinitions.map(t => t.category))];
