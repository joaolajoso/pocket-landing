import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Define available languages
export type Language = 'pt' | 'en' | 'fr' | 'es';

export interface LanguageInfo {
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

export const languages: Record<Language, LanguageInfo> = {
  'pt': { name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', dir: 'ltr' },
  'en': { name: 'English', nativeName: 'English', flag: 'EN', dir: 'ltr' },
  'fr': { name: 'French', nativeName: 'Français', flag: '🇫🇷', dir: 'ltr' },
  'es': { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', dir: 'ltr' },
};

// Detect browser language and map to supported languages
const detectBrowserLanguage = (): Language => {
  const browserLang = navigator.language.toLowerCase();
  
  if (browserLang.startsWith('pt')) return 'pt';
  if (browserLang.startsWith('en')) return 'en';
  if (browserLang.startsWith('fr')) return 'fr';
  if (browserLang.startsWith('es')) return 'es';
  
  return 'en'; // Fallback to English
};

// Translation content interface
export interface TranslationContent {
  features: {
    title: string;
    subtitle: string;
    description: string;
    items: Array<{
      title: string;
      description: string;
    }>;
  };
  cta: {
    title: string;
    description: string;
    button: string;
  };
  order: {
    title: string;
    description: string;
  };
  contact: {
    title: string;
    description: string;
    button: string;
  };
  howItWorks: {
    title: string;
    description: string;
    steps: Array<{
      title: string;
      description: string;
    }>;
  };
  faq: {
    title: string;
    description: string;
    questions: Array<{
      question: string;
      answer: string;
    }>;
  };
  dashboard: {
    welcome: string;
    quickActions: {
      title: string;
      viewProfile: string;
      editProfile: string;
      manageLinks: string;
      analytics: string;
    };
    statistics: {
      views: string;
      clicks: string;
      saved: string;
    };
    yourLinks: {
      title: string;
      addNew: string;
      emptyState: string;
    };
  };
  settings: {
    title: string;
    tabs: {
      profile: string;
      account: string;
      notifications: string;
    };
    profile: {
      title: string;
      description: string;
      tooltip: string;
      updated: string;
      updateDescription: string;
    };
    account: {
      title: string;
      description: string;
      emailLabel: string;
      logOut: string;
      loggedOut: string;
      loggedOutDescription: string;
      deactivate: string;
      deactivateDescription: string;
      deactivateButton: string;
      deactivated: string;
      deactivatedDescription: string;
      deactivateError: string;
      deactivateErrorDescription: string;
      confirmDeactivate: string;
    };
    notifications: {
      title: string;
      description: string;
      comingSoon: string;
    };
    auth: {
      required: string;
      requiredDescription: string;
    };
  };
  login: {
    welcomeBack: string;
    createAccount: string;
    loginSubtitle: string;
    signupSubtitle: string;
    onboardingLogin: string;
    onboardingSignup: string;
    tabs: {
      login: string;
      signup: string;
      forgotPassword: string;
    };
    accountType: {
      personal: string;
      business: string;
    };
    fields: {
      email: string;
      password: string;
      name: string;
      adminName: string;
      fullName: string;
      companyName: string;
      companySize: string;
      confirmPassword: string;
    };
    placeholders: {
      email: string;
      password: string;
      name: string;
      company: string;
    };
    buttons: {
      signIn: string;
      signInBusiness: string;
      createAccount: string;
      createBusinessAccount: string;
      sendResetLink: string;
      backToLogin: string;
      forgotPassword: string;
      orContinueWith: string;
      linkedIn: string;
    };
    errors: {
      emailRequired: string;
      emailInvalid: string;
      passwordRequired: string;
      nameRequired: string;
      passwordMin: string;
      confirmPasswordRequired: string;
      passwordsNoMatch: string;
      companyNameRequired: string;
      companySizeRequired: string;
      invalidCredentials: string;
    };
    forgotPassword: {
      title: string;
      description: string;
      checkEmail: string;
      emailSent: string;
      emailSentDescription: string;
    };
    resetPassword: {
      title: string;
      description: string;
      newPassword: string;
      confirmNewPassword: string;
      cancel: string;
      resetButton: string;
      updating: string;
      success: string;
      successDescription: string;
      invalidLink: string;
      error: string;
    };
    footer: {
      noAccount: string;
      signUp: string;
      haveAccount: string;
      logIn: string;
      rememberPassword: string;
    };
    companySize: {
      select: string;
      small: string;
      medium: string;
      large: string;
      xlarge: string;
      enterprise: string;
    };
    terms: {
      agreeText: string;
      terms: string;
      and: string;
      privacy: string;
    };
    loading: {
      signingIn: string;
      creatingAccount: string;
      sending: string;
    };
  };
}

// Define translations
export const translations: Record<Language, TranslationContent> = {
  'pt': {
    features: {
      title: 'Tudo o Que Precisa',
      subtitle: 'Revolucione o networking e a captação de leads de eventos da sua equipa de vendas. Crie cartões de visita digitais profissionais que conectam instantaneamente prospects ao seu CRM, eliminam desperdício de papel e fornecem análises em tempo real sobre cada interação.',
      description: 'A PocketCV combina todas as ferramentas essenciais de networking para estudantes e jovens profissionais numa única plataforma simples.',
      items: [
        {
          title: 'Centralize os Seus Links',
          description: 'Armazene e partilhe todos os seus links profissionais num só lugar - LinkedIn, portfólio, currículo e informações de contacto.'
        },
        {
          title: 'Habilitado para NFC',
          description: 'Partilhe o seu perfil instantaneamente com um toque do seu cartão PocketCV em qualquer smartphone com NFC.'
        },
        {
          title: 'Focado em Estudantes',
          description: 'Projetado especificamente para estudantes universitários e jovens profissionais a entrar no mercado de trabalho.'
        },
        {
          title: 'URLs Memoráveis',
          description: 'Obtenha o seu próprio link personalizado que é fácil de lembrar e partilhar com potenciais empregadores.'
        },
        {
          title: 'Integração com CV',
          description: 'Carregue e partilhe o seu currículo diretamente através do seu link pessoal para candidaturas simplificadas.'
        },
        {
          title: 'Integração de Contactos',
          description: 'Adicione as suas informações de contacto e perfis sociais para que recrutadores possam entrar em contacto facilmente.'
        }
      ]
    },
    cta: {
      title: 'Veja em ação',
      description: 'Dê uma olhada num perfil de exemplo para ver como a PocketCV o ajuda a partilhar a sua identidade profissional com um simples toque.',
      button: 'Ver Perfil de Exemplo'
    },
    order: {
      title: 'Pronto para Encomendar?',
      description: 'Preencha o formulário abaixo para fazer o seu pedido. Entraremos em contacto o mais breve possível.'
    },
    contact: {
      title: 'Entre em Contacto',
      description: 'Tem perguntas sobre a PocketCV? Entre em contacto connosco diretamente.',
      button: 'Contacte-nos Agora'
    },
    howItWorks: {
      title: 'Como a PocketCV Funciona',
      description: 'Obtenha o seu cartão de visita digital e comece a fazer networking em minutos',
      steps: [
        {
          title: 'Encomende o Seu Cartão',
          description: 'Escolha o design do seu cartão PocketCV e faça o seu pedido online.'
        },
        {
          title: 'Crie o Seu Perfil',
          description: 'Configure o seu perfil digital com as suas informações, links e currículo.'
        },
        {
          title: 'Comece a Fazer Networking',
          description: 'Partilhe o seu perfil instantaneamente com um toque do seu cartão em qualquer smartphone.'
        },
        {
          title: 'Acompanhe o Engagement',
          description: 'Veja quem visualizou o seu perfil e quais links recebem mais cliques.'
        }
      ]
    },
    faq: {
      title: 'Perguntas Frequentes',
      description: 'Encontre respostas para perguntas comuns sobre a PocketCV',
      questions: [
        {
          question: 'Como funciona o cartão NFC?',
          answer: 'O cartão NFC contém um pequeno chip que comunica com smartphones. Basta tocar o seu cartão em qualquer telemóvel habilitado para NFC para partilhar instantaneamente o seu perfil.'
        },
        {
          question: 'Preciso de pagar uma subscrição?',
          answer: 'Não, a PocketCV tem um modelo de pagamento único. Paga uma vez pelo seu cartão e obtém acesso vitalício ao seu perfil digital.'
        },
        {
          question: 'Posso atualizar as minhas informações após o pedido?',
          answer: 'Sim, pode atualizar as informações do seu perfil, links e currículo a qualquer momento através do seu painel PocketCV.'
        },
        {
          question: 'E se alguém não tiver um telemóvel habilitado para NFC?',
          answer: 'Cada cartão também inclui um código QR que pode ser lido por qualquer smartphone, garantindo que o seu perfil está sempre acessível.'
        },
        {
          question: 'Quanto tempo demora o envio?',
          answer: 'O envio padrão normalmente leva de 3 a 5 dias úteis em Portugal e de 7 a 14 dias para pedidos internacionais.'
        }
      ]
    },
    dashboard: {
      welcome: 'Bem-vindo de volta',
      quickActions: {
        title: 'Ações Rápidas',
        viewProfile: 'Ver Perfil',
        editProfile: 'Editar Perfil',
        manageLinks: 'Gerir Links',
        analytics: 'Ver Análises'
      },
      statistics: {
        views: 'Visualizações do Perfil',
        clicks: 'Cliques em Links',
        saved: 'Perfis Guardados'
      },
      yourLinks: {
        title: 'Os Seus Links',
        addNew: 'Adicionar Novo Link',
        emptyState: 'Ainda não adicionou nenhum link. Clique no botão acima para adicionar o seu primeiro link.'
      }
    },
    settings: {
      title: 'Definições',
      tabs: {
        profile: 'Perfil',
        account: 'Conta',
        notifications: 'Notificações'
      },
      profile: {
        title: 'Informação do Perfil',
        description: 'Atualize as informações do seu perfil visíveis a outros',
        tooltip: 'Gerir as definições da sua conta aqui. Adicione uma biografia profissional (inclua o cargo, competências e informação de contacto), atualize a sua foto de perfil e gerir as suas preferências de conta. Mantenha a sua informação atualizada para a melhor presença profissional.',
        updated: 'Perfil atualizado',
        updateDescription: 'As alterações ao seu perfil foram guardadas'
      },
      account: {
        title: 'Definições da Conta',
        description: 'Gerir definições da conta e serviços conectados',
        emailLabel: 'Endereço de Email',
        logOut: 'Terminar Sessão',
        loggedOut: 'Sessão terminada',
        loggedOutDescription: 'Terminou a sessão com sucesso',
        deactivate: 'Desativar Conta',
        deactivateDescription: 'Desative a sua conta — não poderá mais aceder',
        deactivateButton: 'Desativar Conta',
        deactivated: 'Conta desativada',
        deactivatedDescription: 'A sua conta foi desativada com sucesso',
        deactivateError: 'Erro',
        deactivateErrorDescription: 'Houve um problema ao desativar a sua conta',
        confirmDeactivate: 'Tem a certeza que deseja desativar a sua conta? Não poderá mais aceder a ela.'
      },
      notifications: {
        title: 'Preferências de Notificações',
        description: 'Gerir como recebe notificações',
        comingSoon: 'As definições de notificações estarão disponíveis numa atualização futura.'
      },
      auth: {
        required: 'Autenticação necessária',
        requiredDescription: 'Precisa estar autenticado para aceder às definições.'
      }
    },
    login: {
      welcomeBack: 'Bem-vindo de volta',
      createAccount: 'Crie a sua conta',
      loginSubtitle: 'Entre para aceder ao seu painel da PocketCV',
      signupSubtitle: 'Junte-se à PocketCV para criar a sua página profissional',
      onboardingLogin: 'Entre na sua conta para ativar o seu cartão de visitas digital',
      onboardingSignup: 'Este cartão está prestes a tornar-se o seu novo cartão de visitas digital. Bem-vindo!',
      tabs: {
        login: 'Entrar',
        signup: 'Criar Conta',
        forgotPassword: 'Recuperar Palavra-passe'
      },
      accountType: {
        personal: 'Pessoal',
        business: 'Empresa'
      },
      fields: {
        email: 'Email',
        password: 'Palavra-passe',
        name: 'Nome',
        adminName: 'Nome do Administrador',
        fullName: 'Nome Completo',
        companyName: 'Nome da Empresa',
        companySize: 'Tamanho da Empresa',
        confirmPassword: 'Confirmar Palavra-passe'
      },
      placeholders: {
        email: 'o_seu@email.com',
        password: '••••••••',
        name: 'João Silva',
        company: 'Acme Inc.'
      },
      buttons: {
        signIn: 'Entrar',
        signInBusiness: 'Entrar na Conta Empresarial',
        createAccount: 'Criar Conta',
        createBusinessAccount: 'Criar Conta Empresarial',
        sendResetLink: 'Enviar link de recuperação',
        backToLogin: 'Voltar',
        forgotPassword: 'Esqueceu a palavra-passe?',
        orContinueWith: 'OU CONTINUE COM',
        linkedIn: 'Continuar com LinkedIn'
      },
      errors: {
        emailRequired: 'O email é obrigatório',
        emailInvalid: 'Por favor insira um endereço de email válido',
        passwordRequired: 'A palavra-passe é obrigatória',
        nameRequired: 'O nome é obrigatório',
        passwordMin: 'A palavra-passe deve ter pelo menos 8 caracteres',
        confirmPasswordRequired: 'Por favor confirme a sua palavra-passe',
        passwordsNoMatch: 'As palavras-passe não coincidem',
        companyNameRequired: 'O nome da empresa é obrigatório',
        companySizeRequired: 'O tamanho da empresa é obrigatório',
        invalidCredentials: 'E-mail ou palavra-passe incorretos'
      },
      forgotPassword: {
        title: 'Recuperar palavra-passe',
        description: 'Insira o seu email e enviaremos um link para redefinir a sua palavra-passe.',
        checkEmail: 'Verifique o seu email',
        emailSent: 'Email enviado',
        emailSentDescription: 'Um email com instruções para redefinir a sua palavra-passe foi enviado. Por favor verifique também a sua pasta de spam. O email será enviado por Supabase Auth.'
      },
      resetPassword: {
        title: 'Redefinir palavra-passe',
        description: 'Crie uma nova palavra-passe para a sua conta.',
        newPassword: 'Nova Palavra-passe',
        confirmNewPassword: 'Confirmar Nova Palavra-passe',
        cancel: 'Cancelar',
        resetButton: 'Redefinir Palavra-passe',
        updating: 'A atualizar...',
        success: 'Palavra-passe redefinida com sucesso',
        successDescription: 'A sua palavra-passe foi atualizada. Pode agora entrar com a nova palavra-passe.',
        invalidLink: 'Link inválido ou expirado. Solicite um novo link de recuperação.',
        error: 'Erro ao processar o link de recuperação. Tente novamente.'
      },
      footer: {
        noAccount: 'Não tem conta?',
        signUp: 'Criar conta',
        haveAccount: 'Já tem conta?',
        logIn: 'Entrar',
        rememberPassword: 'Lembra-se da palavra-passe?'
      },
      companySize: {
        select: 'Selecionar tamanho da empresa',
        small: '1-10 colaboradores',
        medium: '11-50 colaboradores',
        large: '51-200 colaboradores',
        xlarge: '201-500 colaboradores',
        enterprise: '501+ colaboradores'
      },
      terms: {
        agreeText: 'Ao criar conta, concorda com os nossos',
        terms: 'Termos de Serviço',
        and: 'e',
        privacy: 'Política de Privacidade'
      },
      loading: {
        signingIn: 'A entrar...',
        creatingAccount: 'A criar conta...',
        sending: 'A enviar...'
      }
    }
  },
  en: {
    features: {
      title: 'All your networking needs in one platform',
      subtitle: 'Revolutionize your networking capabilities and event lead capture. Instantly connect with prospects and gain access to real-time analytics. Optimize your in-event ROI.',
      description: 'PocketCV combines all the essential networking tools for students and young professionals in one simple platform.',
      items: [
        {
          title: 'Centralize Your Links',
          description: 'Store and share all your professional links in one place - LinkedIn, portfolio, resume, and contact information.'
        },
        {
          title: 'NFC Enabled',
          description: 'Share your profile instantly with a tap of your NFC device on any NFC-enabled smartphone.'
        },
        {
          title: 'Student Focused',
          description: 'Designed specifically for university students and young professionals entering the job market.'
        },
        {
          title: 'Memorable URLs',
          description: 'Get your own personalized link that\'s easy to remember and share with potential employers.'
        },
        {
          title: 'CV Integration',
          description: 'Upload and share your resume or CV directly through your personal link for seamless job applications.'
        },
        {
          title: 'Contact Integration',
          description: 'Add your contact information and social profiles so recruiters can easily reach out to you.'
        }
      ]
    },
    cta: {
      title: 'See it in action',
      description: 'Take a look at an example profile to see how PocketCV helps you share your professional identity with a simple tap.',
      button: 'View Example Profile'
    },
    order: {
      title: 'Ready to Order?',
      description: 'Fill out the form below to place your order. We\'ll get back to you as soon as possible.'
    },
    contact: {
      title: 'Get in Touch',
      description: 'Have questions about PocketCV? Reach out to us directly.',
      button: 'Contact Us Now'
    },
    howItWorks: {
      title: 'How PocketCV Works',
      description: 'Get your digital business card and start networking in minutes',
      steps: [
        {
          title: 'Order Your Card',
          description: 'Choose your design and place your order online.'
        },
        {
          title: 'Create Your Profile',
          description: 'Set up your digital profile with your information, links, and resume.'
        },
        {
          title: 'Start Networking',
          description: 'Share your profile instantly with a tap of your card on any smartphone.'
        },
        {
          title: 'Track Engagement',
          description: 'See who viewed your profile and which links get the most clicks.'
        }
      ]
    },
    faq: {
      title: 'Frequently Asked Questions',
      description: 'Find answers to common questions about PocketCV',
      questions: [
        {
          question: 'How does the NFC card work?',
          answer: 'The NFC card contains a small chip that communicates with smartphones. Simply tap your card on any NFC-enabled phone to instantly share your profile.'
        },
        {
          question: 'Do I need to pay a subscription?',
          answer: 'No, PocketCV has a one-time payment model. You pay once for your card and get lifetime access to your digital profile.'
        },
        {
          question: 'Can I update my information after ordering?',
          answer: 'Yes, you can update your profile information, links, and resume anytime through your PocketCV dashboard.'
        },
        {
          question: 'What if someone doesn\'t have an NFC-enabled phone?',
          answer: 'Each card also includes a QR code that can be scanned by any smartphone, ensuring your profile is always accessible.'
        },
        {
          question: 'How long does shipping take?',
          answer: 'Standard shipping typically takes 3-5 business days within Portugal, and 7-14 days for international orders.'
        }
      ]
    },
    dashboard: {
      welcome: 'Welcome back',
      quickActions: {
        title: 'Quick Actions',
        viewProfile: 'View Profile',
        editProfile: 'Edit Profile',
        manageLinks: 'Manage Links',
        analytics: 'View Analytics'
      },
      statistics: {
        views: 'Profile Views',
        clicks: 'Link Clicks',
        saved: 'Saved Profiles'
      },
      yourLinks: {
        title: 'Your Links',
        addNew: 'Add New Link',
        emptyState: 'You haven\'t added any links yet. Click the button above to add your first link.'
      }
    },
    settings: {
      title: 'Settings',
      tabs: { profile: 'Profile', account: 'Account', notifications: 'Notifications' },
      profile: { title: 'Profile Information', description: 'Update your profile information visible to others', tooltip: 'Manage your account settings here. Add a professional bio (include your role, skills, and contact info), update your profile photo, and manage your account preferences. Keep your information up to date for the best professional presence.', updated: 'Profile updated', updateDescription: 'Your profile changes have been saved' },
      account: { title: 'Account Settings', description: 'Manage your account settings and connected services', emailLabel: 'Email Address', logOut: 'Log Out', loggedOut: 'Logged out', loggedOutDescription: 'You have been successfully logged out', deactivate: 'Deactivate Account', deactivateDescription: 'Deactivate your account - you will no longer be able to access it', deactivateButton: 'Deactivate Account', deactivated: 'Account deactivated', deactivatedDescription: 'Your account has been deactivated successfully', deactivateError: 'Error', deactivateErrorDescription: 'There was a problem deactivating your account', confirmDeactivate: 'Are you sure you want to deactivate your account? You will no longer be able to access it.' },
      notifications: { title: 'Notification Preferences', description: 'Manage how you receive notifications', comingSoon: 'Notification settings will be available in a future update.' },
      auth: { required: 'Authentication required', requiredDescription: 'You need to be logged in to access settings.' }
    },
    login: {
      welcomeBack: 'Welcome back', createAccount: 'Create your account', loginSubtitle: 'Sign in to access your PocketCV dashboard', signupSubtitle: 'Join PocketCV to create your professional page', onboardingLogin: 'Sign in to activate your digital business card', onboardingSignup: 'This card is about to become your new digital business card. Welcome!',
      tabs: { login: 'Login', signup: 'Sign Up', forgotPassword: 'Reset Password' },
      accountType: { personal: 'Personal', business: 'Business' },
      fields: { email: 'Email', password: 'Password', name: 'Name', adminName: 'Admin Name', fullName: 'Full Name', companyName: 'Company Name', companySize: 'Company Size', confirmPassword: 'Confirm Password' },
      placeholders: { email: 'your@email.com', password: '••••••••', name: 'John Doe', company: 'Acme Inc.' },
      buttons: { signIn: 'Sign in', signInBusiness: 'Sign in to Business Account', createAccount: 'Create Account', createBusinessAccount: 'Create Business Account', sendResetLink: 'Send reset link', backToLogin: 'Back', forgotPassword: 'Forgot password?', orContinueWith: 'OR CONTINUE WITH', linkedIn: 'Continue with LinkedIn' },
      errors: { emailRequired: 'Email is required', emailInvalid: 'Please enter a valid email address', passwordRequired: 'Password is required', nameRequired: 'Name is required', passwordMin: 'Password must be at least 8 characters', confirmPasswordRequired: 'Please confirm your password', passwordsNoMatch: 'Passwords do not match', companyNameRequired: 'Company name is required', companySizeRequired: 'Company size is required', invalidCredentials: 'Invalid email or password' },
      forgotPassword: { title: 'Reset your password', description: 'Enter your email and we\'ll send you a link to reset your password.', checkEmail: 'Check your email', emailSent: 'Email sent', emailSentDescription: 'We\'ve sent a password reset link to your email. Please also check your spam folder. The email will be sent from Supabase Auth.' },
      resetPassword: { title: 'Reset your password', description: 'Create a new password for your account.', newPassword: 'New Password', confirmNewPassword: 'Confirm New Password', cancel: 'Cancel', resetButton: 'Reset Password', updating: 'Updating...', success: 'Password reset successful', successDescription: 'Your password has been updated. You can now log in with your new password.', invalidLink: 'Invalid or expired link. Please request a new recovery link.', error: 'Error processing recovery link. Please try again.' },
      footer: { noAccount: 'Don\'t have an account?', signUp: 'Sign up', haveAccount: 'Already have an account?', logIn: 'Log in', rememberPassword: 'Remember your password?' },
      companySize: { select: 'Select company size', small: '1-10 employees', medium: '11-50 employees', large: '51-200 employees', xlarge: '201-500 employees', enterprise: '501+ employees' },
      terms: { agreeText: 'By signing up, you agree to our', terms: 'Terms of Service', and: 'and', privacy: 'Privacy Policy' },
      loading: { signingIn: 'Signing in...', creatingAccount: 'Creating Account...', sending: 'Sending...' }
    }
  },
  fr: {
    features: {
      title: 'Tout ce dont vous avez besoin',
      subtitle: 'Révolutionnez le réseau et la capture de leads d\'événements de votre équipe commerciale. Créez des cartes de visite numériques professionnelles qui connectent instantanément les prospects à votre CRM, éliminent le gaspillage de papier et fournissent des analyses en temps réel sur chaque interaction.',
      description: 'PocketCV combine tous les outils de réseau essentiels pour les étudiants et les jeunes professionnels sur une seule plateforme simple.',
      items: [
        {
          title: 'Centralisez vos liens',
          description: 'Stockez et partagez tous vos liens professionnels en un seul endroit - LinkedIn, portfolio, CV et informations de contact.'
        },
        {
          title: 'Compatible NFC',
          description: 'Partagez votre profil instantanément avec un simple tap de votre carte PocketCV sur n\'importe quel smartphone NFC.'
        },
        {
          title: 'Axé sur les étudiants',
          description: 'Conçu spécifiquement pour les étudiants universitaires et les jeunes professionnels entrant sur le marché du travail.'
        },
        {
          title: 'URLs mémorables',
          description: 'Obtenez votre propre lien personnalisé facile à retenir et à partager avec les employeurs potentiels.'
        },
        {
          title: 'Intégration CV',
          description: 'Téléchargez et partagez votre CV directement via votre lien personnel pour des candidatures simplifiées.'
        },
        {
          title: 'Intégration des contacts',
          description: 'Ajoutez vos informations de contact et profils sociaux pour que les recruteurs puissent vous contacter facilement.'
        }
      ]
    },
    cta: {
      title: 'Voir en action',
      description: 'Regardez un profil d\'exemple pour voir comment PocketCV vous aide à partager votre identité professionnelle avec un simple tap.',
      button: 'Voir un profil d\'exemple'
    },
    order: {
      title: 'Prêt à commander?',
      description: 'Remplissez le formulaire ci-dessous pour passer votre commande. Nous vous recontacterons dans les plus brefs délais.'
    },
    contact: {
      title: 'Contactez-nous',
      description: 'Vous avez des questions sur PocketCV? Contactez-nous directement.',
      button: 'Nous contacter maintenant'
    },
    howItWorks: {
      title: 'Comment fonctionne PocketCV',
      description: 'Obtenez votre carte de visite digitale et commencez à réseauter en minutes',
      steps: [
        {
          title: 'Commandez votre carte',
          description: 'Choisissez votre design et passez votre commande en ligne.'
        },
        {
          title: 'Créez votre profil',
          description: 'Configurez votre profil digital avec vos informations, liens et CV.'
        },
        {
          title: 'Commencez à réseauter',
          description: 'Partagez votre profil instantanément avec un tap de votre carte sur n\'importe quel smartphone.'
        },
        {
          title: 'Suivez l\'engagement',
          description: 'Voyez qui a consulté votre profil et quels liens obtiennent le plus de clics.'
        }
      ]
    },
    faq: {
      title: 'Questions fréquentes',
      description: 'Trouvez des réponses aux questions courantes sur PocketCV',
      questions: [
        {
          question: 'Comment fonctionne la carte NFC?',
          answer: 'La carte NFC contient une petite puce qui communique avec les smartphones. Tapez simplement votre carte sur n\'importe quel téléphone NFC pour partager instantanément votre profil.'
        },
        {
          question: 'Dois-je payer un abonnement?',
          answer: 'Non, PocketCV a un modèle de paiement unique. Vous payez une fois pour votre carte et obtenez un accès à vie à votre profil digital.'
        },
        {
          question: 'Puis-je mettre à jour mes informations après la commande?',
          answer: 'Oui, vous pouvez mettre à jour les informations de votre profil, liens et CV à tout moment via votre tableau de bord PocketCV.'
        },
        {
          question: 'Et si quelqu\'un n\'a pas de téléphone NFC?',
          answer: 'Chaque carte inclut également un code QR qui peut être scanné par n\'importe quel smartphone, garantissant que votre profil est toujours accessible.'
        },
        {
          question: 'Combien de temps prend la livraison?',
          answer: 'La livraison standard prend généralement 3 à 5 jours ouvrables au Portugal et 7 à 14 jours pour les commandes internationales.'
        }
      ]
    },
    dashboard: {
      welcome: 'Content de vous revoir',
      quickActions: {
        title: 'Actions rapides',
        viewProfile: 'Voir le profil',
        editProfile: 'Modifier le profil',
        manageLinks: 'Gérer les liens',
        analytics: 'Voir les analyses'
      },
      statistics: {
        views: 'Vues du profil',
        clicks: 'Clics sur les liens',
        saved: 'Profils sauvegardés'
      },
      yourLinks: {
        title: 'Vos liens',
        addNew: 'Ajouter un nouveau lien',
        emptyState: 'Vous n\'avez pas encore ajouté de liens. Cliquez sur le bouton ci-dessus pour ajouter votre premier lien.'
      }
    },
    settings: { title: 'Settings', tabs: { profile: 'Profile', account: 'Account', notifications: 'Notifications' }, profile: { title: 'Profile Information', description: 'Update your profile information visible to others', tooltip: 'Manage your account settings here. Add a professional bio, update your profile photo, and manage your account preferences.', updated: 'Profile updated', updateDescription: 'Your profile changes have been saved' }, account: { title: 'Account Settings', description: 'Manage your account settings and connected services', emailLabel: 'Email Address', logOut: 'Log Out', loggedOut: 'Logged out', loggedOutDescription: 'You have been successfully logged out', deactivate: 'Deactivate Account', deactivateDescription: 'Deactivate your account', deactivateButton: 'Deactivate Account', deactivated: 'Account deactivated', deactivatedDescription: 'Your account has been deactivated', deactivateError: 'Error', deactivateErrorDescription: 'There was a problem deactivating your account', confirmDeactivate: 'Are you sure?' }, notifications: { title: 'Notification Preferences', description: 'Manage notifications', comingSoon: 'Coming soon.' }, auth: { required: 'Authentication required', requiredDescription: 'You need to be logged in.' } },
    login: { welcomeBack: 'Welcome back', createAccount: 'Create account', loginSubtitle: 'Sign in to PocketCV', signupSubtitle: 'Join PocketCV', onboardingLogin: 'Sign in to activate your card', onboardingSignup: 'Welcome!', tabs: { login: 'Login', signup: 'Sign Up', forgotPassword: 'Reset Password' }, accountType: { personal: 'Personal', business: 'Business' }, fields: { email: 'Email', password: 'Password', name: 'Name', adminName: 'Admin Name', fullName: 'Full Name', companyName: 'Company Name', companySize: 'Company Size', confirmPassword: 'Confirm Password' }, placeholders: { email: 'your@email.com', password: '••••••••', name: 'John Doe', company: 'Acme Inc.' }, buttons: { signIn: 'Sign in', signInBusiness: 'Sign in to Business', createAccount: 'Create Account', createBusinessAccount: 'Create Business Account', sendResetLink: 'Send reset link', backToLogin: 'Back', forgotPassword: 'Forgot password?', orContinueWith: 'OR CONTINUE WITH', linkedIn: 'Continue with LinkedIn' }, errors: { emailRequired: 'Email required', emailInvalid: 'Invalid email', passwordRequired: 'Password required', nameRequired: 'Name required', passwordMin: 'Min 8 characters', confirmPasswordRequired: 'Confirm password', passwordsNoMatch: 'Passwords do not match', companyNameRequired: 'Company name required', companySizeRequired: 'Company size required', invalidCredentials: 'E-mail ou mot de passe incorrect' }, forgotPassword: { title: 'Reset password', description: 'Enter your email', checkEmail: 'Check email', emailSent: 'Email sent', emailSentDescription: 'Check your inbox' }, resetPassword: { title: 'Reset password', description: 'Create new password', newPassword: 'New Password', confirmNewPassword: 'Confirm Password', cancel: 'Cancel', resetButton: 'Reset', updating: 'Updating...', success: 'Success', successDescription: 'Password updated', invalidLink: 'Invalid link', error: 'Error' }, footer: { noAccount: 'No account?', signUp: 'Sign up', haveAccount: 'Have account?', logIn: 'Log in', rememberPassword: 'Remember password?' }, companySize: { select: 'Select size', small: '1-10', medium: '11-50', large: '51-200', xlarge: '201-500', enterprise: '501+' }, terms: { agreeText: 'By signing up, you agree', terms: 'Terms', and: 'and', privacy: 'Privacy' }, loading: { signingIn: 'Signing in...', creatingAccount: 'Creating...', sending: 'Sending...' } }
  },
  es: {
    features: {
      title: 'Todo lo que necesitas',
      subtitle: 'Revoluciona el networking y la captura de leads de eventos de tu equipo de ventas. Crea tarjetas de presentación digitales profesionales que conectan instantáneamente prospectos a tu CRM, eliminan el desperdicio de papel y proporcionan análisis en tiempo real sobre cada interacción.',
      description: 'PocketCV combina todas las herramientas esenciales de networking para estudiantes y jóvenes profesionales en una plataforma simple.',
      items: [
        {
          title: 'Centraliza tus enlaces',
          description: 'Almacena y comparte todos tus enlaces profesionales en un solo lugar - LinkedIn, portafolio, CV e información de contacto.'
        },
        {
          title: 'Compatible con NFC',
          description: 'Comparte tu perfil instantáneamente con un toque de tu tarjeta PocketCV en cualquier smartphone NFC.'
        },
        {
          title: 'Enfocado en estudiantes',
          description: 'Diseñado específicamente para estudiantes universitarios y jóvenes profesionales que ingresan al mercado laboral.'
        },
        {
          title: 'URLs memorables',
          description: 'Obtén tu propio enlace personalizado que es fácil de recordar y compartir con empleadores potenciales.'
        },
        {
          title: 'Integración de CV',
          description: 'Sube y comparte tu currículum directamente a través de tu enlace personal para solicitudes de trabajo simplificadas.'
        },
        {
          title: 'Integración de contactos',
          description: 'Añade tu información de contacto y perfiles sociales para que los reclutadores puedan contactarte fácilmente.'
        }
      ]
    },
    cta: {
      title: 'Verlo en acción',
      description: 'Echa un vistazo a un perfil de ejemplo para ver cómo PocketCV te ayuda a compartir tu identidad profesional con un simple toque.',
      button: 'Ver perfil de ejemplo'
    },
    order: {
      title: '¿Listo para ordenar?',
      description: 'Completa el formulario a continuación para realizar tu pedido. Te contactaremos lo antes posible.'
    },
    contact: {
      title: 'Contáctanos',
      description: '¿Tienes preguntas sobre PocketCV? Contáctanos directamente.',
      button: 'Contáctanos ahora'
    },
    howItWorks: {
      title: 'Cómo funciona PocketCV',
      description: 'Obtén tu tarjeta de visita digital y comienza a hacer networking en minutos',
      steps: [
        {
          title: 'Pide tu tarjeta',
          description: 'Elige tu diseño y realiza tu pedido en línea.'
        },
        {
          title: 'Crea tu perfil',
          description: 'Configura tu perfil digital con tu información, enlaces y CV.'
        },
        {
          title: 'Comienza a hacer networking',
          description: 'Comparte tu perfil instantáneamente con un toque de tu tarjeta en cualquier smartphone.'
        },
        {
          title: 'Rastrea el engagement',
          description: 'Ve quién vio tu perfil y qué enlaces obtienen más clics.'
        }
      ]
    },
    faq: {
      title: 'Preguntas frecuentes',
      description: 'Encuentra respuestas a preguntas comunes sobre PocketCV',
      questions: [
        {
          question: '¿Cómo funciona la tarjeta NFC?',
          answer: 'La tarjeta NFC contiene un pequeño chip que se comunica con smartphones. Simplemente toca tu tarjeta en cualquier teléfono NFC para compartir instantáneamente tu perfil.'
        },
        {
          question: '¿Necesito pagar una suscripción?',
          answer: 'No, PocketCV tiene un modelo de pago único. Pagas una vez por tu tarjeta y obtienes acceso de por vida a tu perfil digital.'
        },
        {
          question: '¿Puedo actualizar mi información después de ordenar?',
          answer: 'Sí, puedes actualizar la información de tu perfil, enlaces y CV en cualquier momento a través de tu panel de PocketCV.'
        },
        {
          question: '¿Qué pasa si alguien no tiene un teléfono NFC?',
          answer: 'Cada tarjeta también incluye un código QR que puede ser escaneado por cualquier smartphone, asegurando que tu perfil siempre esté accesible.'
        },
        {
          question: '¿Cuánto tiempo tarda el envío?',
          answer: 'El envío estándar generalmente tarda de 3 a 5 días hábiles dentro de Portugal y de 7 a 14 días para pedidos internacionales.'
        }
      ]
    },
    dashboard: {
      welcome: 'Bienvenido de vuelta',
      quickActions: {
        title: 'Acciones rápidas',
        viewProfile: 'Ver perfil',
        editProfile: 'Editar perfil',
        manageLinks: 'Gestionar enlaces',
        analytics: 'Ver análisis'
      },
      statistics: {
        views: 'Vistas del perfil',
        clicks: 'Clics en enlaces',
        saved: 'Perfiles guardados'
      },
      yourLinks: {
        title: 'Tus enlaces',
        addNew: 'Agregar nuevo enlace',
        emptyState: 'Aún no has agregado ningún enlace. Haz clic en el botón de arriba para agregar tu primer enlace.'
      }
    },
    settings: { title: 'Settings', tabs: { profile: 'Profile', account: 'Account', notifications: 'Notifications' }, profile: { title: 'Profile Information', description: 'Update your profile', tooltip: 'Manage settings', updated: 'Updated', updateDescription: 'Changes saved' }, account: { title: 'Account', description: 'Manage account', emailLabel: 'Email', logOut: 'Log Out', loggedOut: 'Logged out', loggedOutDescription: 'Successfully logged out', deactivate: 'Deactivate', deactivateDescription: 'Deactivate account', deactivateButton: 'Deactivate', deactivated: 'Deactivated', deactivatedDescription: 'Account deactivated', deactivateError: 'Error', deactivateErrorDescription: 'Problem occurred', confirmDeactivate: 'Are you sure?' }, notifications: { title: 'Notifications', description: 'Manage notifications', comingSoon: 'Coming soon' }, auth: { required: 'Auth required', requiredDescription: 'Login required' } },
    login: { welcomeBack: 'Welcome', createAccount: 'Create account', loginSubtitle: 'Sign in', signupSubtitle: 'Join', onboardingLogin: 'Sign in', onboardingSignup: 'Welcome!', tabs: { login: 'Login', signup: 'Sign Up', forgotPassword: 'Reset' }, accountType: { personal: 'Personal', business: 'Business' }, fields: { email: 'Email', password: 'Password', name: 'Name', adminName: 'Admin', fullName: 'Full Name', companyName: 'Company', companySize: 'Size', confirmPassword: 'Confirm' }, placeholders: { email: 'email@example.com', password: '••••••••', name: 'Name', company: 'Company' }, buttons: { signIn: 'Sign in', signInBusiness: 'Business Sign in', createAccount: 'Create', createBusinessAccount: 'Create Business', sendResetLink: 'Send link', backToLogin: 'Back', forgotPassword: 'Forgot?', orContinueWith: 'OR', linkedIn: 'LinkedIn' }, errors: { emailRequired: 'Email required', emailInvalid: 'Invalid email', passwordRequired: 'Password required', nameRequired: 'Name required', passwordMin: 'Min 8 chars', confirmPasswordRequired: 'Confirm required', passwordsNoMatch: 'No match', companyNameRequired: 'Company required', companySizeRequired: 'Size required', invalidCredentials: 'Email o contraseña incorrectos' }, forgotPassword: { title: 'Reset', description: 'Enter email', checkEmail: 'Check email', emailSent: 'Sent', emailSentDescription: 'Check inbox' }, resetPassword: { title: 'Reset', description: 'New password', newPassword: 'New', confirmNewPassword: 'Confirm', cancel: 'Cancel', resetButton: 'Reset', updating: 'Updating...', success: 'Success', successDescription: 'Updated', invalidLink: 'Invalid', error: 'Error' }, footer: { noAccount: 'No account?', signUp: 'Sign up', haveAccount: 'Have account?', logIn: 'Log in', rememberPassword: 'Remember?' }, companySize: { select: 'Select', small: '1-10', medium: '11-50', large: '51-200', xlarge: '201-500', enterprise: '501+' }, terms: { agreeText: 'Agree to', terms: 'Terms', and: 'and', privacy: 'Privacy' }, loading: { signingIn: 'Signing...', creatingAccount: 'Creating...', sending: 'Sending...' } }
  }
};

// Create language context type
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationContent;
}

// Create the context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Language provider component
export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Priority: 1. localStorage, 2. Browser detection, 3. Fallback to English
    const savedLanguage = localStorage.getItem('pocketcv-language');
    
    // Migrate old 'pt-PT' or 'pt-BR' to 'pt'
    if (savedLanguage === 'pt-PT' || savedLanguage === 'pt-BR') {
      localStorage.setItem('pocketcv-language', 'pt');
      return 'pt';
    }
    
    if (savedLanguage && savedLanguage in languages) {
      return savedLanguage as Language;
    }
    return detectBrowserLanguage();
  });

  useEffect(() => {
    localStorage.setItem('pocketcv-language', language);
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };
  
  // Get translations for current language
  const t = translations[language];
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  
  return context;
};
