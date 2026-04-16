export const dashboardTranslations = {
  'pt': {
    // Sidebar Navigation
    navigation: {
      overview: 'A Minha PocketCV',
      links: 'Links',
      analytics: 'Analytics',
      network: 'Networking',
      events: 'Eventos',
      business: 'Empresa',
      appearance: 'Página Pública',
      settings: 'Definições',
      tips: 'Dicas de Uso',
      shop: 'Loja'
    },
    
    // Overview Tab
    overview: {
      title: 'Visão Geral',
      welcome: 'Bem-vindo de volta',
      subtitle: 'Gerir o seu perfil PocketCV e links',
      
      // PWA Install Card
      installPWA: {
        title: 'Instalar a App PocketCV',
        description: 'Instale a nossa app para melhor eficiência de leitura de código QR e partilha instantânea de perfil. Aceda ao seu perfil offline e tenha uma experiência nativa.',
        enhancedQR: 'Eficiência melhorada de código QR',
        installationGuide: 'Guia de Instalação',
        installNow: 'Instalar Agora',
        installing: 'A instalar...',
        appInstalled: 'App Instalada',
        iosInstructions: 'iOS (iPhone/iPad)',
        androidInstructions: 'Android',
        iosStep1: '1. Abrir a PocketCV no Safari',
        iosStep2: '2. Tocar no botão Partilhar (quadrado com seta)',
        iosStep3: '3. Deslizar para baixo e tocar em "Adicionar ao Ecrã Principal"',
        iosStep4: '4. Tocar em "Adicionar" para confirmar',
        androidStep1: '1. Abrir a PocketCV no Chrome',
        androidStep2: '2. Tocar no menu de três pontos (⋮)',
        androidStep3: '3. Selecionar "Adicionar ao ecrã principal"',
        androidStep4: '4. Tocar em "Adicionar" para confirmar',
        proTip: '💡 Dica profissional: Depois de instalada, pode ler códigos QR instantaneamente e partilhar o seu perfil mesmo sem ligação à internet!'
      },
      
      // Usage Tips
      usageTips: {
        title: 'Dicas de Uso da PocketCV'
      },
      
      // Quick Actions
      quickActions: {
        title: 'Ações Rápidas',
        description: 'Gerir o seu perfil PocketCV',
        addNewLink: 'Adicionar Novo Link',
        viewPublicProfile: 'Ver Perfil Público',
        viewPublicPage: 'Ver página pública',
        shareProfile: 'Partilhar Perfil',
        generateQR: 'Gerar Código QR',
        refreshMetrics: 'Atualizar Métricas',
        editProfile: 'Editar Perfil'
      },
      
      // Statistics
      stats: {
        profileViews: 'Visualizações do Perfil',
        linkClicks: 'Cliques em Links',
        conversionRate: 'Taxa de Conversão',
        totalViews: 'Total de visualizações do perfil esta semana',
        totalClicks: 'Total de cliques em qualquer link esta semana',
        clicksPerView: 'Cliques por visualização do perfil',
        fromLastWeek: 'desde a semana passada',
        viewsOverLast7Days: 'Visualizações nos últimos 7 dias',
        fullAnalytics: 'Analytics Completos'
      },
      
      // Profile Section
      profile: {
        editProfile: 'Editar Perfil',
        bio: 'Bio',
        addBio: 'Adicione uma bio para contar aos visitantes sobre si e o que faz.',
        profileViewsThisWeek: 'visualizações do perfil esta semana',
        linkClicksThisWeek: 'cliques em links esta semana',
        profileViews: 'visualizações do perfil',
        linkClicks: 'cliques em links',
        addYourName: 'Adicione o seu nome',
        share: 'Partilhar',
        qr: 'QR',
        edit: 'Editar',
        profileQRCode: 'Código QR do Perfil'
      },
      
      // Completion Tasks
      completion: {
        title: 'Complete o Seu Perfil',
        description: 'Siga estes passos para aproveitar ao máximo a sua PocketCV'
      }
    },
    
    // Toasts & Messages
    messages: {
      linkCopied: 'Link copiado',
      linkCopiedDescription: 'O link do seu perfil foi copiado para a área de transferência',
      usernameNotSet: 'Username não definido',
      usernameNotSetDescription: 'Por favor defina um username nas definições do perfil primeiro',
      metricsRefreshed: 'Métricas atualizadas',
      metricsRefreshedDescription: 'As métricas do seu perfil foram atualizadas',
      profileUpdated: 'Perfil atualizado',
      profileUpdatedDescription: 'As alterações ao seu perfil foram guardadas',
      sharedSuccessfully: 'Partilhado com sucesso!',
      profileLinkCopied: 'Link do perfil copiado!',
      linkCopiedFull: 'Link copiado:'
    },
    
    // Account Menu
    account: {
      myAccount: 'A Minha Conta',
      profile: 'Perfil',
      settings: 'Definições',
      logout: 'Terminar Sessão'
    },

    // Social Links
    socialLinks: {
      title: 'Redes Sociais',
      linkSaved: 'Link guardado!',
      linkUpdated: 'atualizado com sucesso.',
      emptyLink: 'Link vazio',
      enterValidLink: 'Por favor, insira um link válido.',
      configure: 'Configurar',
      linkName: 'Nome do Link',
      linkNamePlaceholder: 'Ex: O Meu Perfil Profissional',
      linkUrl: 'URL do Link',
      linkUrlPlaceholder: 'Ex: https://linkedin.com/in/seuperfil',
      testLink: 'Testar Link',
      save: 'Guardar'
    },

    // Experience
    experience: {
      title: 'Experiência',
      add: 'Adicionar',
      loading: 'A carregar...',
      empty: 'Adicione as suas experiências profissionais, educacionais ou projetos relevantes',
      addExperience: 'Adicionar Experiência',
      editExperience: 'Editar Experiência',
      deleteConfirm: 'Tem a certeza que deseja remover esta experiência?',
      types: {
        current_job: 'Trabalho Atual',
        past_job: 'Trabalho Anterior',
        education: 'Educação',
        project: 'Projeto',
        award: 'Prémio/Conquista',
        other: 'Outro'
      },
      fields: {
        type: 'Tipo de Experiência',
        institution: 'Instituição',
        projectName: 'Nome do Projeto',
        awardName: 'Nome do Prémio',
        company: 'Empresa/Organização',
        degree: 'Grau/Curso',
        projectRole: 'Função no Projeto',
        category: 'Categoria',
        role: 'Cargo/Posição',
        startDate: 'Data de Início',
        endDate: 'Data de Término',
        description: 'Descrição',
        descriptionPlaceholder: 'Descreva as suas responsabilidades, conquistas ou o que aprendeu...',
        currentPosition: 'Atualmente nesta posição'
      },
      actions: {
        cancel: 'Cancelar',
        update: 'Atualizar',
        add: 'Adicionar'
      }
    },

    // Custom Links
    customLinks: {
      title: 'Os Meus Links',
      addLink: 'Adicionar Link',
      editLink: 'Editar Link',
      empty: 'Ainda não tem links adicionados',
      emptySubtitle: 'Clique em "Adicionar Link" para começar',
      requiredFields: 'Campos obrigatórios',
      fillTitleUrl: 'Por favor, preencha o título e URL',
      linkUpdated: 'Link atualizado',
      linkUpdatedDesc: 'O link foi atualizado com sucesso',
      linkAdded: 'Link adicionado',
      linkAddedDesc: 'O link foi adicionado com sucesso',
      linkRemoved: 'Link removido',
      linkRemovedDesc: 'O link foi removido com sucesso',
      fields: {
        title: 'Título',
        titlePlaceholder: 'Ex: O Meu Portfolio',
        url: 'URL',
        urlPlaceholder: 'Ex: https://exemplo.com',
        chooseIcon: 'Escolha um ícone'
      },
      actions: {
        update: 'Atualizar',
        add: 'Adicionar'
      }
    },

    // Network Tab
    network: {
      title: 'Networking',
      subtitle: 'Gerir conexões e contactos da sua rede profissional',
      allowSaves: 'Outros podem guardar o seu perfil',
      disallowSaves: 'Outros não podem guardar o seu perfil',
      tabs: {
        connections: 'Conexões',
        matchmaking: 'Matchmaking',
        leadCapture: 'Captura de Leads',
        organizations: 'Organizações'
      },
      noConnections: 'Ainda sem conexões',
      emptyMessage: 'A sua rede está vazia. Quando alguém guardar o seu perfil ou guardar o deles, aparecerão aqui.',
      searchPlaceholder: 'Procurar conexões...',
      refresh: 'Atualizar',
      viewProfile: 'Ver Perfil',
      noResults: 'Nenhuma conexão encontrada'
    },

    // Business Tab
    business: {
      performanceSummary: 'Resumo de Performance',
      last30Days: 'Últimos 30 dias',
      avgViewsPerEmployee: 'Média de Visualizações por Colaborador',
      avgLeadsPerEmployee: 'Média de Leads por Colaborador',
      totalConnections: 'Total de Conexões',
      clickThroughRate: 'Taxa de Cliques',
      topNetworker: 'Melhor Networker',
      bestPerformance: 'Melhor performance do mês',
      teamMembers: 'Membros da Equipa',
      activeMembers: 'membros ativos da equipa',
      noPerformanceData: 'Sem dados de performance disponíveis',
      views: 'Visualizações',
      leads: 'Leads',
      connections: 'Conexões',
      clicks: 'Cliques'
    }
  },
  
  'en': {
    // Sidebar Navigation
    navigation: {
      overview: 'My PocketCV',
      links: 'Links',
      analytics: 'Analytics',
      network: 'Networking',
      events: 'Events',
      business: 'Business',
      appearance: 'Public Page',
      settings: 'Settings',
      tips: 'Usage Tips',
      shop: 'Shop'
    },
    
    // Overview Tab
    overview: {
      title: 'Overview',
      welcome: 'Welcome back',
      subtitle: 'Manage your PocketCV profile and links',
      
      // PWA Install Card
      installPWA: {
        title: 'Install PocketCV App',
        description: 'Install our web app for faster QR code scanning and instant profile sharing. Access your profile offline and get a native app experience.',
        enhancedQR: 'Enhanced QR code efficiency',
        installationGuide: 'Installation Guide',
        installNow: 'Install Now',
        installing: 'Installing...',
        appInstalled: 'App Installed',
        iosInstructions: 'iOS (iPhone/iPad)',
        androidInstructions: 'Android',
        iosStep1: '1. Open PocketCV in Safari',
        iosStep2: '2. Tap the Share button (square with arrow)',
        iosStep3: '3. Scroll down and tap "Add to Home Screen"',
        iosStep4: '4. Tap "Add" to confirm',
        androidStep1: '1. Open PocketCV in Chrome',
        androidStep2: '2. Tap the three dots menu (⋮)',
        androidStep3: '3. Select "Add to Home screen"',
        androidStep4: '4. Tap "Add" to confirm',
        proTip: '💡 Pro tip: Once installed, you can scan QR codes instantly and share your profile even without internet connection!'
      },
      
      // Usage Tips
      usageTips: {
        title: 'PocketCV Usage Tips'
      },
      
      // Quick Actions
      quickActions: {
        title: 'Quick Actions',
        description: 'Manage your PocketCV profile',
        addNewLink: 'Add New Link',
        viewPublicProfile: 'View Public Profile',
        viewPublicPage: 'View public page',
        shareProfile: 'Share Profile',
        generateQR: 'Generate QR Code',
        refreshMetrics: 'Refresh Metrics',
        editProfile: 'Edit Profile'
      },
      
      // Statistics
      stats: {
        profileViews: 'Profile Views',
        linkClicks: 'Link Clicks',
        conversionRate: 'Conversion Rate',
        totalViews: 'Total profile views this week',
        totalClicks: 'Total clicks on any link this week',
        clicksPerView: 'Clicks per profile view',
        fromLastWeek: 'from last week',
        viewsOverLast7Days: 'Views over the last 7 days',
        fullAnalytics: 'Full Analytics'
      },
      
      // Profile Section
      profile: {
        editProfile: 'Edit Profile',
        bio: 'Bio',
        addBio: 'Add a bio to tell visitors about yourself and what you do.',
        profileViewsThisWeek: 'profile views this week',
        linkClicksThisWeek: 'link clicks this week',
        profileViews: 'profile views',
        linkClicks: 'link clicks',
        addYourName: 'Add your name',
        share: 'Share',
        qr: 'QR',
        edit: 'Edit',
        profileQRCode: 'Profile QR Code'
      },
      
      // Completion Tasks
      completion: {
        title: 'Complete Your Profile',
        description: 'Take these steps to get the most out of your PocketCV'
      }
    },
    
    // Toasts & Messages
    messages: {
      linkCopied: 'Link copied',
      linkCopiedDescription: 'Your profile link has been copied to clipboard',
      usernameNotSet: 'Username not set',
      usernameNotSetDescription: 'Please set a username in your profile settings first',
      metricsRefreshed: 'Metrics refreshed',
      metricsRefreshedDescription: 'Your profile metrics have been updated',
      profileUpdated: 'Profile updated',
      profileUpdatedDescription: 'Your profile changes have been saved',
      sharedSuccessfully: 'Shared successfully!',
      profileLinkCopied: 'Profile link copied!',
      linkCopiedFull: 'Link copied:'
    },
    
    // Account Menu
    account: {
      myAccount: 'My Account',
      profile: 'Profile',
      settings: 'Settings',
      logout: 'Logout'
    },

    // Social Links
    socialLinks: {
      title: 'Social Networks',
      linkSaved: 'Link saved!',
      linkUpdated: 'updated successfully.',
      emptyLink: 'Empty link',
      enterValidLink: 'Please enter a valid link.',
      configure: 'Configure',
      linkName: 'Link Name',
      linkNamePlaceholder: 'Ex: My Professional Profile',
      linkUrl: 'Link URL',
      linkUrlPlaceholder: 'Ex: https://linkedin.com/in/yourprofile',
      testLink: 'Test Link',
      save: 'Save'
    },

    // Experience
    experience: {
      title: 'Experience',
      add: 'Add',
      loading: 'Loading...',
      empty: 'Add your professional experiences, education or relevant projects',
      addExperience: 'Add Experience',
      editExperience: 'Edit Experience',
      deleteConfirm: 'Are you sure you want to remove this experience?',
      types: {
        current_job: 'Current Job',
        past_job: 'Past Job',
        education: 'Education',
        project: 'Project',
        award: 'Award/Achievement',
        other: 'Other'
      },
      fields: {
        type: 'Experience Type',
        institution: 'Institution',
        projectName: 'Project Name',
        awardName: 'Award Name',
        company: 'Company/Organization',
        degree: 'Degree/Course',
        projectRole: 'Project Role',
        category: 'Category',
        role: 'Role/Position',
        startDate: 'Start Date',
        endDate: 'End Date',
        description: 'Description',
        descriptionPlaceholder: 'Describe your responsibilities, achievements or what you learned...',
        currentPosition: 'Currently in this position'
      },
      actions: {
        cancel: 'Cancel',
        update: 'Update',
        add: 'Add'
      }
    },

    // Custom Links
    customLinks: {
      title: 'My Links',
      addLink: 'Add Link',
      editLink: 'Edit Link',
      empty: 'No links added yet',
      emptySubtitle: 'Click "Add Link" to get started',
      requiredFields: 'Required fields',
      fillTitleUrl: 'Please fill in the title and URL',
      linkUpdated: 'Link updated',
      linkUpdatedDesc: 'The link was updated successfully',
      linkAdded: 'Link added',
      linkAddedDesc: 'The link was added successfully',
      linkRemoved: 'Link removed',
      linkRemovedDesc: 'The link was removed successfully',
      fields: {
        title: 'Title',
        titlePlaceholder: 'Ex: My Portfolio',
        url: 'URL',
        urlPlaceholder: 'Ex: https://example.com',
        chooseIcon: 'Choose an icon'
      },
      actions: {
        update: 'Update',
        add: 'Add'
      }
    },

    // Network Tab
    network: {
      title: 'Networking',
      subtitle: 'Manage connections and contacts from your professional network',
      allowSaves: 'Others can save your profile',
      disallowSaves: 'Others cannot save your profile',
      tabs: {
        connections: 'Connections',
        matchmaking: 'Matchmaking',
        leadCapture: 'Lead Capture',
        organizations: 'Organizations'
      },
      noConnections: 'No connections yet',
      emptyMessage: 'Your network is empty. When someone saves your profile or you save theirs, they\'ll appear here.',
      searchPlaceholder: 'Search connections...',
      refresh: 'Refresh',
      viewProfile: 'View Profile',
      noResults: 'No connections found'
    },

    // Business Tab
    business: {
      performanceSummary: 'Performance Summary',
      last30Days: 'Last 30 days',
      avgViewsPerEmployee: 'Avg. Views per Employee',
      avgLeadsPerEmployee: 'Avg. Leads per Employee',
      totalConnections: 'Total Connections',
      clickThroughRate: 'Click-through Rate',
      topNetworker: 'Top Networker',
      bestPerformance: 'Best performance this month',
      teamMembers: 'Team Members',
      activeMembers: 'active team members',
      noPerformanceData: 'No performance data available',
      views: 'Views',
      leads: 'Leads',
      connections: 'Connections',
      clicks: 'Clicks'
    }
  }
};
