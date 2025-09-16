/**
 * Localization strings for Portuguese-BR
 * All app text should be defined here for maintainability
 */

export const strings = {
  // Common
  common: {
    ok: 'OK',
    cancel: 'Cancelar',
    error: 'Erro',
    loading: 'Carregando...',
    save: 'Salvar',
    edit: 'Editar',
    delete: 'Excluir',
    confirm: 'Confirmar',
    back: 'Voltar',
    next: 'Próximo',
    done: 'Concluído',
  },

  // Navigation
  navigation: {
    home: 'Início',
    explore: 'Explorar',
    new: 'Novo',
  },

  // Authentication
  auth: {
    welcomeBack: 'Bem-vindo de Volta',
    signInToContinue: 'Entre para continuar',
    email: 'E-mail',
    password: 'Senha',
    signIn: 'Entrar',
    enterYourEmail: 'Digite seu e-mail',
    enterYourPassword: 'Digite sua senha',
    loginButtonPressed: 'Botão de login pressionado',
  },

  // Chat
  chat: {
    aiAssistant: 'Assistente IA',
    aiThinking: 'IA está pensando...',
    typeMessage: 'Digite sua mensagem...',
    helloMessage: 'Olá! Como posso ajudá-lo hoje?',
    errorTitle: 'Erro',
    errorMessage: 'Falha ao enviar mensagem. Verifique sua conexão e tente novamente.',
  },

  // Form Validation
  validation: {
    fieldRequired: 'Este campo deve ser preenchido.',
    invalidEmail: 'Este não é um e-mail válido.',
    passwordMinLength: 'A senha deve ter pelo menos 6 caracteres',
  },

  // Input Components
  input: {
    username: 'Nome de usuário',
    enterUsername: 'Digite seu nome de usuário',
    chooseUniqueUsername: 'Escolha um nome de usuário único',
    enterEmail: 'Digite seu e-mail',
    enterPassword: 'Digite sua senha',
  },

  // Examples/Demo
  examples: {
    title: 'Exemplos de Input HeroUI',
    basicInputs: 'Inputs Básicos',
    variants: 'Variantes',
    states: 'Estados',
    sizes: 'Tamanhos',
    colors: 'Cores',
    customStyles: 'Estilos Personalizados',
    withContent: 'Com Conteúdo',

    // Variants
    flatInput: 'Input Plano',
    flatVariant: 'Variante plana',
    borderedInput: 'Input com Borda',
    borderedVariant: 'Variante com borda',
    fadedInput: 'Input Desbotado',
    fadedVariant: 'Variante desbotada',
    underlinedInput: 'Input Sublinhado',
    underlinedVariant: 'Variante sublinhada',

    // States
    disabledInput: 'Input Desabilitado',
    disabledPlaceholder: 'Este input está desabilitado',
    disabledValue: 'Valor desabilitado',
    readOnlyInput: 'Input Somente Leitura',
    readOnlyPlaceholder: 'Este input é somente leitura',
    readOnlyValue: 'Este é um texto somente leitura',
    readOnlyDescription: 'Este campo não pode ser editado',
    errorState: 'Estado de Erro',
    errorPlaceholder: 'Isto tem um erro',
    errorMessage: 'Este campo tem um erro',

    // Sizes
    smallInput: 'Input Pequeno',
    smallSize: 'Tamanho pequeno',
    mediumInput: 'Input Médio',
    mediumSize: 'Tamanho médio (padrão)',
    largeInput: 'Input Grande',
    largeSize: 'Tamanho grande',

    // Colors
    primary: 'Primário',
    secondary: 'Secundário',
    success: 'Sucesso',
    warning: 'Aviso',
    danger: 'Perigo',
    primaryColor: 'Cor primária',
    secondaryColor: 'Cor secundária',
    successColor: 'Cor de sucesso',
    warningColor: 'Cor de aviso',
    dangerColor: 'Cor de perigo',

    // Custom
    customStyledInput: 'Input com Estilo Personalizado',
    customStylesApplied: 'Estilos personalizados aplicados',

    // With Content
    search: 'Pesquisar',
    searchSomething: 'Pesquisar algo...',
    websiteUrl: 'URL do Site',
  },

  // Not Found
  notFound: {
    title: 'Ops!',
    message: 'Esta tela não existe.',
    goHome: 'Ir para a tela inicial!',
  },
} as const;

export type StringKeys = keyof typeof strings;