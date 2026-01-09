import { 
  BsCreditCard2Front,
  BsHouseDoor,
  BsCart3,
  BsBusFront,
  BsCurrencyDollar,
  BsClipboardCheck,
  BsHeartPulse,
  BsController,
  BsBook,
  BsBag,
  BsGraphUpArrow,
  BsFileText,
  BsCreditCard,
  BsTelephone,
  BsCashCoin,
  BsTrophy,
  BsPiggyBank,
  BsArrowUpCircle,
  BsGift,
  BsLightbulb,
  BsCup,
  BsFillFuelPumpFill,
  BsWallet2,
  BsShop,
  BsTools,
  BsBriefcase,
  BsCalendar,
  BsWifi,
  BsPlug,
  BsDroplet,
  BsFire,
  BsCake,
  BsBasket,
  BsTicket,
  BsCameraVideo,
  BsPhone,
  BsLaptop,
  BsCloudDownload,
  BsPrinter,
  BsKey,
  BsShield,
  BsClock,
  BsStar,
  BsHeart,
  BsEnvelope,
  BsGear,
  BsPersonCircle,
  BsPeople,
  BsBuilding,
  BsAirplane,
  BsGlobe,
  BsMap,
  BsChatDots,
  BsPalette,
  BsNewspaper
} from 'react-icons/bs';

/**
 * DICIONÁRIO DE ÍCONES DISPONÍVEIS
 * Estes são os únicos ícones que podem ser usados no sistema
 * O nome do ícone será salvo na planilha (Configurações!F2:F)
 * A COR do ícone é baseada no tipo: RECEITA (verde) ou DESPESA (vermelho)
 */
export const availableIconsMap = {
  // Finanças e Pagamentos
  'BsCreditCard2Front': { icon: BsCreditCard2Front, label: 'Cartão de Crédito 2' },
  'BsCreditCard': { icon: BsCreditCard, label: 'Cartão de Crédito' },
  'BsCurrencyDollar': { icon: BsCurrencyDollar, label: 'Dólar' },
  'BsCashCoin': { icon: BsCashCoin, label: 'Moeda' },
  'BsWallet2': { icon: BsWallet2, label: 'Carteira' },
  'BsPiggyBank': { icon: BsPiggyBank, label: 'Cofrinho' },
  'BsGraphUpArrow': { icon: BsGraphUpArrow, label: 'Investimentos' },
  'BsTrophy': { icon: BsTrophy, label: 'Troféu' },
  'BsArrowUpCircle': { icon: BsArrowUpCircle, label: 'Receita' },
  
  // Casa e Moradia
  'BsHouseDoor': { icon: BsHouseDoor, label: 'Casa' },
  'BsKey': { icon: BsKey, label: 'Chave' },
  'BsLightbulb': { icon: BsLightbulb, label: 'Luz/Energia' },
  'BsDroplet': { icon: BsDroplet, label: 'Água' },
  'BsFire': { icon: BsFire, label: 'Gás' },
  'BsWifi': { icon: BsWifi, label: 'Internet' },
  'BsPlug': { icon: BsPlug, label: 'Eletricidade' },
  'BsTools': { icon: BsTools, label: 'Manutenção' },
  
  // Compras e Mercado
  'BsCart3': { icon: BsCart3, label: 'Carrinho de Compras' },
  'BsBasket': { icon: BsBasket, label: 'Cesta/Mercado' },
  'BsShop': { icon: BsShop, label: 'Loja' },
  'BsBag': { icon: BsBag, label: 'Sacola' },
  
  // Transporte
  'BsBusFront': { icon: BsBusFront, label: 'Ônibus' },
  'BsFillFuelPumpFill': { icon: BsFillFuelPumpFill, label: 'Combustível' },
  'BsAirplane': { icon: BsAirplane, label: 'Avião' },
  
  // Saúde e Bem-estar
  'BsHeartPulse': { icon: BsHeartPulse, label: 'Saúde' },
  'BsHeart': { icon: BsHeart, label: 'Coração' },
  'BsShield': { icon: BsShield, label: 'Seguro' },
  
  // Educação e Trabalho
  'BsBook': { icon: BsBook, label: 'Livro/Educação' },
  'BsBriefcase': { icon: BsBriefcase, label: 'Trabalho' },
  'BsFileText': { icon: BsFileText, label: 'Documento' },
  'BsClipboardCheck': { icon: BsClipboardCheck, label: 'Lista de Tarefas' },
  'BsBuilding': { icon: BsBuilding, label: 'Escritório' },
  
  // Lazer e Entretenimento
  'BsController': { icon: BsController, label: 'Jogos' },
  'BsCup': { icon: BsCup, label: 'Café/Bar' },
  'BsGift': { icon: BsGift, label: 'Presente' },
  'BsCake': { icon: BsCake, label: 'Festa/Aniversário' },
  'BsTicket': { icon: BsTicket, label: 'Ingressos' },
  'BsCameraVideo': { icon: BsCameraVideo, label: 'Streaming/Cinema' },
  'BsPalette': { icon: BsPalette, label: 'Arte' },
  
  // Tecnologia
  'BsPhone': { icon: BsPhone, label: 'Celular' },
  'BsTelephone': { icon: BsTelephone, label: 'Telefone' },
  'BsLaptop': { icon: BsLaptop, label: 'Computador' },
  'BsCloudDownload': { icon: BsCloudDownload, label: 'Cloud/Downloads' },
  'BsPrinter': { icon: BsPrinter, label: 'Impressora' },
  
  // Outros
  'BsCalendar': { icon: BsCalendar, label: 'Calendário' },
  'BsClock': { icon: BsClock, label: 'Relógio' },
  'BsStar': { icon: BsStar, label: 'Estrela/Favorito' },
  'BsEnvelope': { icon: BsEnvelope, label: 'Correio' },
  'BsGear': { icon: BsGear, label: 'Configurações' },
  'BsPersonCircle': { icon: BsPersonCircle, label: 'Pessoa' },
  'BsPeople': { icon: BsPeople, label: 'Pessoas/Família' },
  'BsGlobe': { icon: BsGlobe, label: 'Viagem' },
  'BsMap': { icon: BsMap, label: 'Mapa' },
  'BsChatDots': { icon: BsChatDots, label: 'Mensagens' },
  'BsNewspaper': { icon: BsNewspaper, label: 'Notícias/Assinatura' },
};

/**
 * Retorna o componente de ícone baseado no nome do ícone
 * @param {string} iconName - Nome do ícone (ex: "BsHouseDoor")
 * @param {string} tipo - "RECEITA" ou "DESPESA" para definir a cor
 * @returns {Object} { Icon: Component, color: string }
 */
export function getIconByName(iconName, tipo = 'DESPESA') {
  const iconData = availableIconsMap[iconName];
  
  // Define cor baseada no tipo da operação
  const color = tipo?.toUpperCase() === 'RECEITA' ? '#10B981' : '#EF4444'; // Verde para receita, vermelho para despesa
  
  if (iconData) {
    return {
      Icon: iconData.icon,
      color: color
    };
  }
  
  // Ícone padrão se não encontrar
  return {
    Icon: BsCurrencyDollar,
    color: '#6B7280' // Cinza para ícone padrão
  };
}

/**
 * Retorna o ícone baseado no mapeamento de categorias (virá da planilha)
 * @param {string} categoria - Nome da categoria
 * @param {string} tipo - "RECEITA" ou "DESPESA"
 * @param {Object} categoryIconMapping - Mapeamento { categoria: iconName } da planilha
 * @returns {Object} { Icon: Component, color: string }
 */
export function getCategoryIcon(categoria, tipo = 'DESPESA', categoryIconMapping = {}) {
  const iconName = categoryIconMapping[categoria];
  
  // Debug temporário
  if (categoria === 'Tecnologia') {
    console.log('🔍 DEBUG Tecnologia:', {
      categoria,
      iconName,
      mapping: categoryIconMapping,
      temMapping: !!iconName
    });
  }
  
  if (iconName) {
    return getIconByName(iconName, tipo);
  }
  
  // Ícone padrão se a categoria não tiver mapeamento
  return getIconByName('BsCurrencyDollar', tipo);
}

/**
 * Lista de todos os ícones disponíveis para seleção na interface
 */
export const availableIconsList = Object.entries(availableIconsMap).map(([name, data]) => ({
  name,
  icon: data.icon,
  label: data.label
}));
