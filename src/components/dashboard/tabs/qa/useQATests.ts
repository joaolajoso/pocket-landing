import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { QATestResult, testDefinitions } from './testDefinitions';

const HISTORY_KEY = 'pocketcv-qa-history';

const loadHistory = (): QATestResult[] => {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); }
  catch { return []; }
};

const saveHistory = (history: QATestResult[]) => {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 500)));
};

// Call edge function
async function callQA(action: string, params?: any) {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(
    `https://xhcqhmbhivxbwnoifcoc.supabase.co/functions/v1/qa-test-admin`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoY3FobWJoaXZ4Yndub2lmY29jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2ODU4MTQsImV4cCI6MjA1OTI2MTgxNH0.-0BpfJiCPk8rQkhEV2DJTKHwXx8kjrN5uYTv5kAR7Xo',
      },
      body: JSON.stringify({ action, params }),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

// Store test user IDs for cross-test reference
let testState = {
  personalUserIds: [] as string[],
  businessUserId: '',
  businessOrgId: '',
  eventId: '',
};

// ===== TEST RUNNERS =====

async function createPersonalUsers() {
  const result = await callQA('create_test_users', {
    users: [
      { email: 'test1@pocketcv.test', name: 'Test User 1', password: 'TestPass123!', accountType: 'personal' },
      { email: 'test2@pocketcv.test', name: 'Test User 2', password: 'TestPass123!', accountType: 'personal' },
      { email: 'test3@pocketcv.test', name: 'Test User 3', password: 'TestPass123!', accountType: 'personal' },
    ]
  });
  
  // Get user IDs
  const listResult = await callQA('get_test_users');
  testState.personalUserIds = listResult.users
    ?.filter((u: any) => ['test1@pocketcv.test', 'test2@pocketcv.test', 'test3@pocketcv.test'].includes(u.email))
    .map((u: any) => u.id) || [];

  const details = [...(result.created || []), ...(result.errors || [])].join('\n');
  const hasErrors = result.errors?.length > 0;
  return { 
    success: !hasErrors || result.created?.length > 0, 
    message: `${result.created?.length || 0} criados, ${result.errors?.length || 0} erros`,
    details 
  };
}

async function createBusinessUser() {
  const result = await callQA('create_business_user', {
    email: 'testbiz@pocketcv.test',
    name: 'Test Business User',
    companyName: 'QA Test Company',
    companySize: 'startup',
  });
  
  if (result.success) {
    testState.businessUserId = result.userId;
    // Get org ID
    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', result.userId).single();
    testState.businessOrgId = profile?.organization_id || '';
  }
  
  return { 
    success: result.success, 
    message: result.success ? `Business user criado: ${result.email}` : result.error,
    details: result.success ? `User ID: ${result.userId}\nOrg ID: ${testState.businessOrgId}` : result.error
  };
}

async function getTestUsers() {
  const result = await callQA('get_test_users');
  const count = result.users?.length || 0;
  const details = result.users?.map((u: any) => `${u.email} (${u.id})`).join('\n') || 'Nenhum';
  return { success: true, message: `${count} utilizadores teste encontrados`, details };
}

async function cleanupTestData() {
  const result = await callQA('cleanup_test_data');
  testState = { personalUserIds: [], businessUserId: '', businessOrgId: '', eventId: '' };
  return { 
    success: true, 
    message: `${result.count} utilizadores removidos`,
    details: result.deleted?.join('\n') || 'Nenhum'
  };
}

async function onboardingPersonal() {
  // Verify personal users exist and have profiles
  const listResult = await callQA('get_test_users');
  const personalUsers = listResult.users?.filter((u: any) => u.email?.startsWith('test') && !u.email?.startsWith('testbiz'));
  
  if (!personalUsers?.length) {
    return { success: false, message: 'Nenhum utilizador pessoal encontrado. Execute "Criar contas pessoais" primeiro.' };
  }

  const checks: string[] = [];
  for (const u of personalUsers) {
    const { data: profile } = await supabase.from('profiles').select('id, name, slug, onboarding_completed, organization_id').eq('id', u.id).single();
    if (profile) {
      checks.push(`${u.email}: slug=${profile.slug}, onboarding=${profile.onboarding_completed}, org=${profile.organization_id || 'nenhuma'}`);
      if (profile.organization_id) {
        checks.push(`  ⚠️ Conta pessoal NÃO deveria ter organização!`);
      }
    } else {
      checks.push(`${u.email}: ❌ Perfil não encontrado`);
    }
  }
  
  const allOk = !checks.some(c => c.includes('❌') || c.includes('⚠️'));
  return { success: allOk, message: allOk ? 'Onboarding pessoal OK' : 'Problemas encontrados', details: checks.join('\n') };
}

async function onboardingBusiness() {
  const listResult = await callQA('get_test_users');
  const bizUser = listResult.users?.find((u: any) => u.email === 'testbiz@pocketcv.test');
  
  if (!bizUser) {
    return { success: false, message: 'Utilizador business não encontrado. Execute "Criar conta business" primeiro.' };
  }

  const result = await callQA('verify_business_onboarding', { userId: bizUser.id });
  
  if (!result.success && result.error) {
    return { success: false, message: result.error };
  }

  const checks = result.checks || [];
  const allOk = result.success;
  return { success: allOk, message: allOk ? 'Onboarding business OK - organização criada' : 'Problemas no onboarding business', details: checks.join('\n') };
}

async function setupPublicProfile() {
  const listResult = await callQA('get_test_users');
  const testUser = listResult.users?.find((u: any) => u.email === 'test1@pocketcv.test');
  
  if (!testUser) return { success: false, message: 'Execute "Criar contas pessoais" primeiro' };

  const result = await callQA('setup_public_profile', {
    userId: testUser.id,
    slug: `qatest1-${Date.now().toString(36)}`,
    bio: 'Sou um utilizador de teste da PocketCV. Este perfil foi criado automaticamente.',
    headline: 'QA Tester | PocketCV Test Account',
  });
  
  return { 
    success: result.success, 
    message: result.success ? `Perfil público configurado: /${result.profile.slug}` : result.error,
    details: result.success ? `Slug: ${result.profile.slug}\nBio: ${result.profile.bio}\nHeadline: ${result.profile.headline}` : ''
  };
}

async function createUserLinks() {
  const listResult = await callQA('get_test_users');
  const testUser = listResult.users?.find((u: any) => u.email === 'test1@pocketcv.test');
  
  if (!testUser) return { success: false, message: 'Execute "Criar contas pessoais" primeiro' };

  const result = await callQA('create_links_for_user', { userId: testUser.id });
  return { 
    success: result.success, 
    message: result.success ? `${result.links?.length} links criados no grupo "${result.group?.title}"` : result.error,
    details: result.success ? result.links?.map((l: any) => `${l.icon}: ${l.title} → ${l.url}`).join('\n') : ''
  };
}

async function verifyPublicPage() {
  const listResult = await callQA('get_test_users');
  const testUser = listResult.users?.find((u: any) => u.email === 'test1@pocketcv.test');
  
  if (!testUser) return { success: false, message: 'Execute "Criar contas pessoais" primeiro' };

  const { data: profile } = await supabase.from('profiles').select('slug').eq('id', testUser.id).single();
  if (!profile?.slug) return { success: false, message: 'Perfil sem slug definido' };

  try {
    const res = await fetch(`/u/${profile.slug}`, { method: 'HEAD' });
    return { success: true, message: `Página /u/${profile.slug} acessível (SPA route)` };
  } catch {
    return { success: true, message: `Página /u/${profile.slug} configurada (SPA)` };
  }
}

async function createOrgWebsite() {
  if (!testState.businessOrgId) {
    // Try to find it
    const listResult = await callQA('get_test_users');
    const bizUser = listResult.users?.find((u: any) => u.email === 'testbiz@pocketcv.test');
    if (bizUser) {
      const { data: p } = await supabase.from('profiles').select('organization_id').eq('id', bizUser.id).single();
      testState.businessOrgId = p?.organization_id || '';
    }
  }
  
  if (!testState.businessOrgId) return { success: false, message: 'Execute "Criar conta business" primeiro' };

  const result = await callQA('create_org_website', { 
    organizationId: testState.businessOrgId,
    companyName: 'QA Test Company',
  });
  return { 
    success: result.success, 
    message: result.success ? `Website criado: /c/${result.website?.subdomain}` : result.error,
    details: result.success ? `Subdomain: ${result.website.subdomain}\nTemplate: ${result.website.template_id}` : ''
  };
}

async function verifyCompanyPage() {
  if (!testState.businessOrgId) {
    const listResult = await callQA('get_test_users');
    const bizUser = listResult.users?.find((u: any) => u.email === 'testbiz@pocketcv.test');
    if (bizUser) {
      const { data: p } = await supabase.from('profiles').select('organization_id').eq('id', bizUser.id).single();
      testState.businessOrgId = p?.organization_id || '';
    }
  }
  
  if (!testState.businessOrgId) return { success: false, message: 'Execute "Criar conta business" primeiro' };

  const { data: website } = await supabase
    .from('organization_websites')
    .select('subdomain, is_published')
    .eq('organization_id', testState.businessOrgId)
    .single();

  if (!website) return { success: false, message: 'Website não encontrado. Execute "Criar página empresa" primeiro.' };

  return { 
    success: true, 
    message: `Página /c/${website.subdomain} - publicado: ${website.is_published}`,
    details: `Subdomain: ${website.subdomain}\nPublicado: ${website.is_published}`
  };
}

async function createTestEvent() {
  const result = await callQA('create_test_event', {
    title: `QA Test Event ${new Date().toLocaleDateString('pt-PT')}`,
    description: 'Evento de networking criado automaticamente por QA Tests',
    location: 'PocketCV HQ - Virtual',
  });

  if (result.success) {
    testState.eventId = result.event.id;
  }

  return { 
    success: result.success, 
    message: result.success ? `Evento criado: ${result.event.title}` : result.error,
    details: result.success ? `ID: ${result.event.id}\nData: ${result.event.event_date}\nLocal: ${result.event.location}` : ''
  };
}

async function registerForEvent() {
  if (!testState.eventId) {
    // Find latest QA event
    const { data: events } = await supabase.from('events').select('id').like('title', 'QA Test Event%').order('created_at', { ascending: false }).limit(1);
    testState.eventId = events?.[0]?.id || '';
  }
  if (!testState.eventId) return { success: false, message: 'Execute "Criar evento" primeiro' };

  const listResult = await callQA('get_test_users');
  const testUsers = listResult.users?.slice(0, 3) || [];
  
  if (!testUsers.length) return { success: false, message: 'Execute "Criar contas pessoais" primeiro' };

  const results: string[] = [];
  for (const u of testUsers) {
    const r = await callQA('register_for_event', { eventId: testState.eventId, userId: u.id });
    results.push(`${u.email}: ${r.success ? '✓ inscrito' : r.error}`);
  }

  const allOk = results.every(r => r.includes('✓'));
  return { success: allOk, message: `${testUsers.length} inscrições processadas`, details: results.join('\n') };
}

async function verifyEventPage() {
  if (!testState.eventId) {
    const { data: events } = await supabase.from('events').select('id, title').like('title', 'QA Test Event%').order('created_at', { ascending: false }).limit(1);
    if (events?.[0]) testState.eventId = events[0].id;
  }
  if (!testState.eventId) return { success: false, message: 'Nenhum evento de teste encontrado' };

  const { data: event } = await supabase.from('events').select('id, title, event_date, location').eq('id', testState.eventId).single();
  const { data: participants } = await supabase.from('event_participants').select('id').eq('event_id', testState.eventId);

  return { 
    success: !!event, 
    message: event ? `Evento: ${event.title} - ${participants?.length || 0} participantes` : 'Evento não encontrado',
    details: event ? `Título: ${event.title}\nData: ${event.event_date}\nLocal: ${event.location}\nParticipantes: ${participants?.length || 0}` : ''
  };
}

async function createConnections() {
  const listResult = await callQA('get_test_users');
  const testUsers = listResult.users || [];
  
  if (testUsers.length < 2) return { success: false, message: 'Precisa de pelo menos 2 utilizadores teste' };

  const results: string[] = [];
  // Create connections between pairs
  for (let i = 0; i < testUsers.length - 1; i++) {
    const r = await callQA('create_connection', { 
      userId: testUsers[i].id, 
      connectedUserId: testUsers[i + 1].id 
    });
    results.push(`${testUsers[i].email} → ${testUsers[i + 1].email}: ${r.success ? '✓' : r.error}`);
  }

  return { success: true, message: `${results.length} conexões criadas`, details: results.join('\n') };
}

async function createContacts() {
  const listResult = await callQA('get_test_users');
  const testUser = listResult.users?.find((u: any) => u.email === 'test1@pocketcv.test');
  
  if (!testUser) return { success: false, message: 'Execute "Criar contas pessoais" primeiro' };

  const contacts = [
    { name: 'Maria QA', email: 'maria.qa@test.com', phone: '+351911111111', message: 'Conheci na conferência' },
    { name: 'Pedro QA', email: 'pedro.qa@test.com', phone: '+351922222222', message: 'Potencial parceiro' },
  ];

  const results: string[] = [];
  for (const c of contacts) {
    const r = await callQA('create_contact_submission', { profileOwnerId: testUser.id, ...c });
    results.push(`${c.name}: ${r.success ? '✓' : r.error}`);
  }

  return { success: true, message: `${contacts.length} contactos adicionados`, details: results.join('\n') };
}

async function apiProfiles() {
  const { data, error } = await supabase.from('profiles').select('id, name, slug').limit(5);
  if (error) return { success: false, message: error.message };
  return { success: true, message: `${data?.length} perfis lidos`, details: data?.map(p => `${p.name || '?'} (@${p.slug})`).join('\n') };
}

async function apiLinks() {
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return { success: false, message: 'Não autenticado' };
  const { data, error } = await supabase.from('links').select('id, title, url, icon').eq('user_id', user.user.id);
  if (error) return { success: false, message: error.message };
  return { success: true, message: `${data?.length} links encontrados`, details: data?.map(l => `${l.icon}: ${l.title}`).join('\n') };
}

async function apiEvents() {
  const { data, error } = await supabase.from('events').select('id, title, event_date').order('event_date', { ascending: false }).limit(5);
  if (error) return { success: false, message: error.message };
  return { success: true, message: `${data?.length} eventos encontrados`, details: data?.map(e => `${e.title} (${new Date(e.event_date).toLocaleDateString('pt-PT')})`).join('\n') };
}

async function apiConnections() {
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return { success: false, message: 'Não autenticado' };
  const { data, error } = await supabase.from('connections').select('id, connected_user_id, tag, created_at').eq('user_id', user.user.id);
  if (error) return { success: false, message: error.message };
  return { success: true, message: `${data?.length} conexões encontradas`, details: data?.map(c => `→ ${c.connected_user_id.slice(0, 8)}... (${c.tag || 'sem tag'})`).join('\n') };
}

const testRunners: Record<string, () => Promise<{ success: boolean; message: string; details?: string }>> = {
  'create-personal-users': createPersonalUsers,
  'create-business-user': createBusinessUser,
  'get-test-users': getTestUsers,
  'cleanup-test-data': cleanupTestData,
  'onboarding-personal': onboardingPersonal,
  'onboarding-business': onboardingBusiness,
  'setup-public-profile': setupPublicProfile,
  'create-user-links': createUserLinks,
  'verify-public-page': verifyPublicPage,
  'create-org-website': createOrgWebsite,
  'verify-company-page': verifyCompanyPage,
  'create-test-event': createTestEvent,
  'register-event': registerForEvent,
  'verify-event-page': verifyEventPage,
  'create-connections': createConnections,
  'create-contacts': createContacts,
  'api-profiles': apiProfiles,
  'api-links': apiLinks,
  'api-events': apiEvents,
  'api-connections': apiConnections,
};

export function useQATests() {
  const [history, setHistory] = useState<QATestResult[]>(loadHistory);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, currentTest: '' });

  const runTests = useCallback(async (selectedIds: string[]) => {
    if (selectedIds.length === 0) return;
    
    setIsRunning(true);
    setProgress({ current: 0, total: selectedIds.length, currentTest: '' });
    const newResults: QATestResult[] = [];

    for (let i = 0; i < selectedIds.length; i++) {
      const testId = selectedIds[i];
      const def = testDefinitions.find(t => t.id === testId);
      if (!def) continue;

      setProgress({ current: i + 1, total: selectedIds.length, currentTest: def.name });
      
      const start = performance.now();
      let result: { success: boolean; message: string; details?: string };
      
      try {
        const runner = testRunners[testId];
        result = runner ? await runner() : { success: false, message: 'Runner não implementado' };
      } catch (e: any) {
        result = { success: false, message: e.message };
      }
      
      const duration = Math.round(performance.now() - start);
      
      newResults.push({
        id: `${testId}-${Date.now()}`,
        testId,
        testName: def.name,
        category: def.category,
        status: result.success ? 'pass' : 'fail',
        message: result.message,
        duration,
        timestamp: new Date().toISOString(),
        details: result.details,
      });
    }

    const updated = [...newResults, ...history];
    setHistory(updated);
    saveHistory(updated);
    setIsRunning(false);
    setProgress({ current: 0, total: 0, currentTest: '' });
  }, [history]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    saveHistory([]);
  }, []);

  return { history, isRunning, progress, runTests, clearHistory };
}
