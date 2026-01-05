import { useState, useMemo, useEffect } from 'react';
import React from 'react';
import { Dropdown } from '@nextui-org/react';
import { useCategorias } from '@/hooks/useFormOptions';

const CategoryDropdown = ({ selectedCategory, onSelect, categoryType }) => {
  const { categorias, loading, error } = useCategorias();
  const [selected, setSelected] = useState(new Set(['Categoria']));
  const selectedValue = useMemo(
    () => Array.from(selected).join(', ').replaceAll('_', ' '),
    [selected]
  );

  const handleSelectionChange = (keys) => {
    setSelected(keys);
    onSelect(Array.from(keys)[0]); // passa a primeira chave selecionada
  };

  // Se houver erro, mostrar no console
  useEffect(() => {
    if (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  }, [error]);

  return (
    <Dropdown>
      <Dropdown.Button 
        flat 
        color={categoryType === "RECEITA" ? "success" : "error"} 
        css={{ tt: 'capitalize' }}
        disabled={loading}
      >
        {loading ? 'Carregando...' : selectedValue}
      </Dropdown.Button>
      <Dropdown.Menu
        aria-label="Seleção única de categoria"
        color={categoryType === "RECEITA" ? "success" : "error"}
        selectionMode="single"
        selectedKeys={selected}
        onSelectionChange={handleSelectionChange}
        id="categoria"
      >
        {categorias.map(cat => (
          <Dropdown.Item key={cat}>
            {cat}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default CategoryDropdown;
