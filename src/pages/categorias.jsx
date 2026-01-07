import React, { useState, useEffect } from 'react';
import { Modal, Progress, Text, Button, Loading } from '@nextui-org/react';
import { getCategoryIcon, availableIconsList } from '@/utils/categoryIcons';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { BsList, BsPieChart, BsPlus } from 'react-icons/bs';
import { AiFillCheckCircle, AiFillExclamationCircle } from 'react-icons/ai';
import { useIsMobile } from '@/hooks/useIsMobile';

ChartJS.register(ArcElement, Tooltip, Legend);

const Categorias = () => {
  const isMobile = useIsMobile();
  
  // Estados para filtro de data e de tipo (receita/despesa)
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(String(new Date().getMonth() + 1).padStart(2, '0'));
  const [selectedTransactionType, setSelectedTransactionType] = useState('DESPESA');
  const [viewMode, setViewMode] = useState('list'); // 'list' ou 'chart'
  const [groupByName, setGroupByName] = useState(false); // agrupar por nome no modal
  
  const [categoriasData, setCategoriasData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [detalhes, setDetalhes] = useState([]);
  const [visible, setVisible] = useState(false);
  const [catModal, setCatModal] = useState('');
  const [categoryIconMapping, setCategoryIconMapping] = useState({});
  
  // Estados para o modal de adicionar categoria
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('BsCurrencyDollar');
  const [addingCategory, setAddingCategory] = useState(false);
  const [categoryCreated, setCategoryCreated] = useState(false);
  const [categoryInvalid, setCategoryInvalid] = useState(false);

  // Converte número do mês para nome
  const monthName = (m) => {
    const names = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    return names[parseInt(m, 10) - 1] || '';
  };

  // Converte nome do mês para número (formato "01", etc.)
  const convertMonthNameToNumber = (name) => {
    const names = {
      'Janeiro': '01',
      'Fevereiro': '02',
      'Março': '03',
      'Abril': '04',
      'Maio': '05',
      'Junho': '06',
      'Julho': '07',
      'Agosto': '08',
      'Setembro': '09',
      'Outubro': '10',
      'Novembro': '11',
      'Dezembro': '12'
    };
    return names[name] || '01';
  };

  // Busca categorias agregadas da API
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/categorias-agregadas?mes=${month}&ano=${year}&tipo=${selectedTransactionType}`);
      const data = await res.json();
      
      if (data.success) {
        setCategoriasData(data.data);
        setTotal(data.totalGeral);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  // Busca o mapeamento de ícones
  const loadIconMapping = async () => {
    try {
      const res = await fetch('/api/category-icons');
      const data = await res.json();
      if (data.success) {
        setCategoryIconMapping(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar mapeamento de ícones:', error);
    }
  };

  // Carrega mapeamento de ícones uma vez
  useEffect(() => {
    loadIconMapping();
  }, []);

  // Chama loadData ao mudar filtros
  useEffect(() => {
    loadData();
  }, [year, month, selectedTransactionType]);

  // Mostra detalhes quando uma categoria é clicada
  const detailCategory = (categoria) => {
    const cat = categoriasData.find(c => c.nome === categoria);
    if (cat) {
      setDetalhes(cat.transacoes);
      setCatModal(categoria);
      setVisible(true);
      setGroupByName(false); // Reset grouping when opening modal
    }
  };

  // Agrupa transações por nome (detalhes)
  const getGroupedTransactions = () => {
    if (!groupByName) {
      return detalhes.slice().reverse();
    }

    // Agrupa por nome (detalhes)
    const groups = {};
    detalhes.forEach((mov) => {
      const nome = mov.detalhes || 'Sem detalhes';
      if (!groups[nome]) {
        groups[nome] = {
          nome: nome,
          transacoes: [],
          total: 0,
        };
      }
      groups[nome].transacoes.push(mov);
      
      // Parse do valor para somar
      const valorLimpo = mov.valor
        .replace('R$', '')
        .replace(/\s/g, '')
        .replace(/\./g, '')
        .replace(',', '.');
      const valorNum = parseFloat(valorLimpo);
      groups[nome].total += Math.abs(valorNum);
    });

    // Converte para array e ordena por total
    return Object.values(groups).sort((a, b) => b.total - a.total);
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  // Adiciona nova categoria
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      setCategoryInvalid(true);
      setTimeout(() => setCategoryInvalid(false), 3000);
      return;
    }

    setAddingCategory(true);
    try {
      const response = await fetch('/api/add-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: newCategoryName.trim(),
          icone: newCategoryIcon,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCategoryCreated(true);
        setTimeout(() => {
          setCategoryCreated(false);
          setAddModalVisible(false);
          setNewCategoryName('');
          setNewCategoryIcon('BsCurrencyDollar');
          // Recarregar página para atualizar lista
          window.location.reload();
        }, 2000);
      } else {
        setCategoryInvalid(true);
        setTimeout(() => setCategoryInvalid(false), 3000);
      }
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error);
      setCategoryInvalid(true);
      setTimeout(() => setCategoryInvalid(false), 3000);
    } finally {
      setAddingCategory(false);
    }
  };

  // Gera cores para o gráfico de pizza
  const generateColors = (count) => {
    const colors = [
      'rgba(255, 99, 132, 0.8)',
      'rgba(54, 162, 235, 0.8)',
      'rgba(255, 206, 86, 0.8)',
      'rgba(75, 192, 192, 0.8)',
      'rgba(153, 102, 255, 0.8)',
      'rgba(255, 159, 64, 0.8)',
      'rgba(199, 199, 199, 0.8)',
      'rgba(83, 102, 255, 0.8)',
      'rgba(255, 99, 255, 0.8)',
      'rgba(99, 255, 132, 0.8)',
    ];
    
    // Repete as cores se houver mais categorias
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(colors[i % colors.length]);
    }
    return result;
  };

  // Prepara dados para o gráfico de pizza
  const chartData = {
    labels: categoriasData.map(cat => cat.nome),
    datasets: [
      {
        label: selectedTransactionType === 'DESPESA' ? 'Despesas' : 'Receitas',
        data: categoriasData.map(cat => cat.total),
        backgroundColor: generateColors(categoriasData.length),
        borderColor: 'rgba(255, 255, 255, 1)',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: isMobile ? 'bottom' : 'right',
        labels: {
          padding: 15,
          font: {
            size: isMobile ? 10 : 12,
          },
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i];
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return {
                  text: `${label}: ${formatarMoeda(value)} (${percentage}%)`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  hidden: false,
                  index: i,
                };
              });
            }
            return [];
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${formatarMoeda(value)} (${percentage}%)`;
          },
        },
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const categoria = categoriasData[index];
        detailCategory(categoria.nome);
      }
    },
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <title>Categorias - CF</title>
      <div className="p-4">
        {/* Filtros: Ano, Mês, Tipo */}
        <div className="flex gap-2 mb-3 items-center justify-between">
          {/* Ano */}
          <select
            id="ano"
            className="flex-1 bg-blue-800 p-2 rounded-lg text-blue-200 font-semibold text-sm"
            onChange={(e) => setYear(e.target.value)}
            value={year}
          >
            {Array.from({ length: new Date().getFullYear() - 2022 }, (_, i) => {
              const y = 2023 + i;
              return (
                <option key={y} value={y}>
                  {y}
                </option>
              );
            })}
          </select>
          
          {/* Mês */}
          <select
            id="mes"
            className="flex-1 bg-blue-200 p-2 rounded-lg text-blue-800 font-semibold text-sm"
            onChange={(e) => setMonth(convertMonthNameToNumber(e.target.value))}
            value={monthName(month)}
          >
            <option>Janeiro</option>
            <option>Fevereiro</option>
            <option>Março</option>
            <option>Abril</option>
            <option>Maio</option>
            <option>Junho</option>
            <option>Julho</option>
            <option>Agosto</option>
            <option>Setembro</option>
            <option>Outubro</option>
            <option>Novembro</option>
            <option>Dezembro</option>
          </select>
          
          {/* Tipo: Receita/Despesa */}
          <select
            id="tipo"
            className="flex-1 bg-blue-200 p-2 rounded-lg text-blue-800 font-semibold text-sm"
            onChange={(e) => setSelectedTransactionType(e.target.value.toUpperCase())}
            value={selectedTransactionType}
          >
            <option value="DESPESA">Despesas</option>
            <option value="RECEITA">Receitas</option>
          </select>
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-2 mb-4 items-center justify-end">
          {/* Switch de visualização Lista/Gráfico */}
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
            title="Visualização em Lista"
            aria-label="Visualização em Lista"
          >
            <BsList size={20} />
          </button>
          <button
            onClick={() => setViewMode('chart')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'chart' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
            title="Visualização em Gráfico"
            aria-label="Visualização em Gráfico"
          >
            <BsPieChart size={20} />
          </button>
          
          {/* Botão para adicionar categoria */}
          <button
            onClick={() => setAddModalVisible(true)}
            className="p-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
            title="Adicionar Nova Categoria"
            aria-label="Adicionar Nova Categoria"
          >
            <BsPlus size={24} />
          </button>
        </div>

        {/* Visualizações */}
        {loading ? (
          <div className="text-center p-8 text-gray-500">
            Carregando...
          </div>
        ) : categoriasData.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            Nenhuma categoria encontrada para este período.
          </div>
        ) : viewMode === 'list' ? (
          /* Lista de Categorias */
          <ul>
            {categoriasData.map((cat, index) => {
              const perc = total ? ((cat.total / total) * 100).toFixed(2) : 0;
              const { Icon, color } = getCategoryIcon(cat.nome, cat.tipo, categoryIconMapping);
              
              return (
                <li
                  key={index}
                  className="bg-gray-50 rounded-lg my-3 p-3 grid grid-cols-2 items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => detailCategory(cat.nome)}
                >
                  <div className="flex items-center">
                    <div className={`rounded-full p-2 mr-3 w-9 h-9 flex justify-center items-center ${
                      cat.tipo === 'RECEITA' ? 'bg-green-200' : 'bg-red-200'
                    }`}>
                      <Icon size={18} color={color} />
                    </div>
                    <Text b className="text-sm">{cat.nome}</Text>
                  </div>
                  <div className="flex items-center justify-end">
                    <div className={`font-semibold text-sm whitespace-nowrap ${cat.tipo === 'RECEITA' ? 'text-green-700' : 'text-red-700'}`}>
                      {formatarMoeda(cat.total)} ({perc.toString().replace(".",",")}%)
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          /* Visualização em Gráfico */
          <div className="bg-white rounded-lg p-6 shadow-sm" style={{ height: '600px' }}>
            <Pie data={chartData} options={chartOptions} />
          </div>
        )}
      </div>

      {/* Modal com detalhes das transações da categoria */}
      <Modal closeButton open={visible} onClose={() => setVisible(false)}>
        <Modal.Header>
          <Text id="modal-title" size={18}>
            <Text b>
              {catModal} - {monthName(month)}/{year}
            </Text>
          </Text>
        </Modal.Header>
        <Modal.Body className="text-center">
          {/* Toggle para agrupar por nome */}
          <div className="flex items-center justify-center gap-3 mb-4 pb-3 border-b">
            <Text className="text-sm text-gray-600">Agrupar por nome:</Text>
            <button
              onClick={() => setGroupByName(false)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                !groupByName 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              Lista
            </button>
            <button
              onClick={() => setGroupByName(true)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                groupByName 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              Agrupado
            </button>
          </div>

          {/* Lista de transações */}
          <ul>
            {!groupByName ? (
              /* Vista normal - lista de transações */
              getGroupedTransactions().map((mov, index) => (
                <li
                  key={index}
                  className="bg-gray-50 rounded-lg my-3 p-2 flex justify-between items-center"
                >
                  <div className="flex flex-col">
                    <Text b>{mov.detalhes || 'Sem detalhes'}</Text>
                    <Text className="text-xs text-gray-500">{mov.conta}</Text>
                    <Text className={selectedTransactionType === 'RECEITA' ? 'text-green-700' : 'text-red-700'}>
                      {mov.valor}
                    </Text>
                  </div>
                  <Text>{mov.data}</Text>
                </li>
              ))
            ) : (
              /* Vista agrupada - por nome */
              getGroupedTransactions().map((group, index) => (
                <li
                  key={index}
                  className="bg-gray-50 rounded-lg my-3 p-3"
                >
                  <div className="flex justify-between items-center mb-2 border-b pb-2">
                    <Text b size={14}>{group.nome}</Text>
                    <Text b className={selectedTransactionType === 'RECEITA' ? 'text-green-700' : 'text-red-700'}>
                      {formatarMoeda(group.total)}
                    </Text>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    {group.transacoes.map((mov, i) => (
                      <div key={i} className="flex justify-between items-center py-1">
                        <span>{mov.conta}</span>
                        <div className="flex items-center gap-2">
                          <span>{mov.valor}</span>
                          <span>•</span>
                          <span>{mov.data}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </li>
              ))
            )}
          </ul>
        </Modal.Body>
      </Modal>

      {/* Modal para Adicionar Nova Categoria */}
      <Modal closeButton open={addModalVisible} onClose={() => setAddModalVisible(false)}>
        <Modal.Header>
          <Text id="modal-add-title" size={18}>
            <Text b>Adicionar Nova Categoria</Text>
          </Text>
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            {/* Nome da Categoria */}
            <div>
              <label className="block text-sm font-semibold mb-1">Nome da Categoria</label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Ex: Farmácia, Vestuário, etc."
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Seleção de Ícone */}
            <div>
              <label className="block text-sm font-semibold mb-2">Ícone</label>
              <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto border rounded-lg p-2">
                {availableIconsList && availableIconsList.map(({ name, icon, label }) => {
                  const IconComponent = icon;
                  
                  // Proteção contra ícone undefined
                  if (!IconComponent) {
                    console.error('Icon undefined for:', name);
                    return null;
                  }
                  
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setNewCategoryIcon(name)}
                      className={`p-3 rounded-lg transition-all flex flex-col items-center justify-center ${
                        newCategoryIcon === name
                          ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                      title={label}
                    >
                      <IconComponent size={24} />
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Ícone selecionado: <strong>{availableIconsList.find(i => i.name === newCategoryIcon)?.label}</strong>
              </p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button auto flat color="error" onClick={() => setAddModalVisible(false)}>
            Cancelar
          </Button>
          <Button auto color={categoryInvalid ? 'warning' : 'success'} onClick={handleAddCategory}>
            {categoryCreated ? (
              <AiFillCheckCircle size={20} />
            ) : addingCategory ? (
              <Loading type="spinner" color="white" size="sm" />
            ) : categoryInvalid ? (
              <AiFillExclamationCircle size={20} />
            ) : (
              'Adicionar'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Categorias;
