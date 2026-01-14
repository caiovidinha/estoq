import { useState, useEffect } from 'react';
import React from 'react';
import { useCategorias } from '@/hooks/useFormOptions';

const CategoryDropdown = ({ selectedCategory, onSelect, categoryType }) => {
  const { categorias, loading, error } = useCategorias();
  const [selected, setSelected] = useState(selectedCategory || '');

  const handleSelectionChange = (e) => {
    const value = e.target.value;
    setSelected(value);
    onSelect(value);
  };

  // Atualiza se a categoria selecionada mudar externamente
  useEffect(() => {
    if (selectedCategory) {
      setSelected(selectedCategory);
    }
  }, [selectedCategory]);

  // Se houver erro, mostrar no console
  useEffect(() => {
    if (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  }, [error]);

  return (
    <select
      value={selected}
      onChange={handleSelectionChange}
      disabled={loading}
      className={`w-full px-3 py-3 rounded-lg font-semibold border-2 transition-all ${
        categoryType === "RECEITA" 
          ? 'bg-green-100 text-green-800 border-green-300 focus:border-green-500 focus:bg-green-50' 
          : 'bg-red-100 text-red-800 border-red-300 focus:border-red-500 focus:bg-red-50'
      }`}
      style={{ fontSize: '16px' }}
      id="categoria"
    >
      <option value="">
        {loading ? 'Carregando...' : 'Selecione uma categoria'}
      </option>
      {categorias.map(cat => (
        <option key={cat} value={cat}>
          {cat}
        </option>
      ))}
    </select>
  );
};

export default CategoryDropdown;
