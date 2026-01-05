import React, { useState, useMemo } from 'react';
import {
  Modal,
  Button,
  Text,
  Input,
  Loading
} from '@nextui-org/react';
// REMOVIDO: import { createCategoria } from '@/services/api';

// Ícones disponíveis
import {
    BiRestaurant,
    BiCar,
    BiPhone,
    BiSolidTShirt,
    BiBomb,
    BiSmile,
    BiGift,
    BiMoneyWithdraw
  } from 'react-icons/bi';
  import { GiWeightLiftingUp, GiHealthNormal } from 'react-icons/gi';
  import { SiBetfair, SiFreelancer, SiYourtraveldottv } from 'react-icons/si';
  import { AiOutlineTool } from 'react-icons/ai';
  import { RiFundsBoxLine, RiBillLine } from 'react-icons/ri';
  import { MdMoneyOff } from 'react-icons/md';
  import { BsThreeDots } from 'react-icons/bs';
  import {
    FaShoppingCart,
    FaHome,
    FaPlane,
    FaCoffee,
    FaBeer,
    FaCarSide,
    FaShoppingBag,
    FaUtensils,
    FaMusic,
    FaBook,
    FaGamepad,
    FaLaptop,
    FaHeart,
    FaGlobe
  } from 'react-icons/fa';
  
  // Array de opções de ícones para seleção (grid)
  // Incluímos os ícones originais e os novos 10 adicionais.
  const ICON_OPTIONS = [
    { key: 'BiRestaurant', label: 'Alimentação', icon: <BiRestaurant size={20} /> },
    { key: 'BiCar', label: 'Locomoção', icon: <BiCar size={20} /> },
    { key: 'GiWeightLiftingUp', label: 'Academia', icon: <GiWeightLiftingUp size={20} /> },
    { key: 'BiPhone', label: 'Celular', icon: <BiPhone size={20} /> },
    { key: 'BiSolidTShirt', label: 'Vestuário', icon: <BiSolidTShirt size={20} /> },
    { key: 'BiBomb', label: 'Dívida', icon: <BiBomb size={20} /> },
    { key: 'BiSmile', label: 'Lazer', icon: <BiSmile size={20} /> },
    { key: 'BiGift', label: 'Presente', icon: <BiGift size={20} /> },
    { key: 'GiHealthNormal', label: 'Saúde', icon: <GiHealthNormal size={20} /> },
    { key: 'SiBetfair', label: 'Bet', icon: <SiBetfair size={20} /> },
    { key: 'AiOutlineTool', label: 'Serviços', icon: <AiOutlineTool size={20} /> },
    { key: 'RiFundsBoxLine', label: 'Investimento', icon: <RiFundsBoxLine size={20} /> },
    { key: 'RiBillLine', label: 'Fatura', icon: <RiBillLine size={20} /> },
    { key: 'BiMoneyWithdraw', label: 'Salário - V4', icon: <BiMoneyWithdraw size={20} /> },
    { key: 'SiFreelancer', label: 'Freelance', icon: <SiFreelancer size={20} /> },
    { key: 'MdMoneyOff', label: 'Reembolso', icon: <MdMoneyOff size={20} /> },
    { key: 'SiYourtraveldottv', label: 'Viagem', icon: <SiYourtraveldottv size={20} /> },
    { key: 'BsThreeDots', label: 'Outros', icon: <BsThreeDots size={20} /> },
    { key: 'FaShoppingCart', label: 'Compras', icon: <FaShoppingCart size={20} /> },
    { key: 'FaHome', label: 'Casa', icon: <FaHome size={20} /> },
    { key: 'FaPlane', label: 'Avião', icon: <FaPlane size={20} /> },
    { key: 'FaCoffee', label: 'Café', icon: <FaCoffee size={20} /> },
    { key: 'FaBeer', label: 'Cerveja', icon: <FaBeer size={20} /> },
    { key: 'FaCarSide', label: 'Carro', icon: <FaCarSide size={20} /> },
    { key: 'FaShoppingBag', label: 'Shopping', icon: <FaShoppingBag size={20} /> },
    { key: 'FaUtensils', label: 'Restaurante', icon: <FaUtensils size={20} /> },
    { key: 'FaMusic', label: 'Música', icon: <FaMusic size={20} /> },
    { key: 'FaBook', label: 'Livros', icon: <FaBook size={20} /> },
    { key: 'FaGamepad', label: 'Jogos', icon: <FaGamepad size={20} /> },
    { key: 'FaLaptop', label: 'Tecnologia', icon: <FaLaptop size={20} /> },
    { key: 'FaHeart', label: 'Amor', icon: <FaHeart size={20} /> },
    { key: 'FaGlobe', label: 'Viagens', icon: <FaGlobe size={20} /> },
  ];

const AddCategoryModal = ({ onClose }) => {
  const [visible, setVisible] = useState(true); // assume que o modal é controlado externamente
  const [categoryName, setCategoryName] = useState('');
  const [categoryType, setCategoryType] = useState('DESPESA'); // 'DESPESA' ou 'RECEITA'
  const [selectedIcon, setSelectedIcon] = useState('BsThreeDots'); // valor padrão
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);

  // Função para criar a categoria
  const createCategory = async () => {
    if (!categoryName.trim()) {
      alert('Digite um nome para a categoria');
      return;
    }
    setLoading(true);

    const payload = {
      name: categoryName.trim(),
      type: categoryType,
      icon: selectedIcon
    };

    try {
      // TODO: Implementar createCategoria com nova API do Google Sheets
      console.warn('createCategoria() precisa ser implementado')
      // await createCategoria(payload);
      setCreated(true);
      setCategoryName('');
      setCategoryType('DESPESA');
      setSelectedIcon('BsThreeDots');
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      alert('Erro ao criar categoria: ' + error.message);
    }
    setLoading(false);
    setTimeout(() => {
      setCreated(false);
      setVisible(false);
      if (onClose) onClose();
    }, 1000);
  };

  return (
    <Modal
      closeButton
      aria-labelledby="modal-title"
      open={visible}
      onClose={() => { setVisible(false); if(onClose) onClose(); }}
    >
      <Modal.Header>
        <Text id="modal-title" size={18}>
          Criar Nova Categoria
        </Text>
      </Modal.Header>
      <Modal.Body>
        <Input
          bordered
          label="Nome da Categoria"
          placeholder="Ex: Alimentação"
          fullWidth
          color="primary"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
        />

        <Text className="mt-4">Tipo</Text>
        <div className="flex gap-4 mt-1">
          <Button
            auto
            flat={categoryType === 'DESPESA'}
            color={categoryType === 'DESPESA' ? 'error' : 'default'}
            onPress={() => setCategoryType('DESPESA')}
          >
            Despesa
          </Button>
          <Button
            auto
            flat={categoryType === 'RECEITA'}
            color={categoryType === 'RECEITA' ? 'success' : 'default'}
            onPress={() => setCategoryType('RECEITA')}
          >
            Receita
          </Button>
        </div>

        <Text className="mt-4">Ícone</Text>
        {/* Grid de seleção de ícones */}
        <div className="grid grid-cols-4 gap-2 mt-2">
          {ICON_OPTIONS.map((opt) => (
            <div
              key={opt.key}
              className={`cursor-pointer p-2 border rounded flex justify-center items-center ${
                selectedIcon === opt.key ? 'border-blue-500' : 'border-gray-300'
              }`}
              onClick={() => setSelectedIcon(opt.key)}
            >
              {opt.icon}
            </div>
          ))}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button auto flat color="error" onPress={() => { setVisible(false); if(onClose) onClose(); }}>
          Fechar
        </Button>
        <Button auto color="success" onPress={createCategory}>
          {created ? (
            'Feito!'
          ) : loading ? (
            <Loading type="spinner" color="white" size="sm" />
          ) : (
            'Criar'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddCategoryModal;
