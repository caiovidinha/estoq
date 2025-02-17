import { useState, useMemo, useEffect } from 'react';
import { Dropdown } from '@nextui-org/react';
import { fetchCategories } from '@/utils/getCategories'; // Função centralizada para buscar categorias

const CategoryDropdown = ({ selectedCategory, onSelect, categoryType }) => {
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState(new Set(['Categoria']));
  const selectedValue = useMemo(
    () => Array.from(selected).join(', ').replaceAll('_', ' '),
    [selected]
  );

  const handleSelectionChange = (keys) => {
    setSelected(keys);
    onSelect(Array.from(keys)[0]); // passa a primeira chave selecionada
  };

  useEffect(() => {
    async function loadCategories() {
      const cats = await fetchCategories();
      // Filtra somente categorias de RECEITA (ou modifique para "DESPESA" conforme o contexto)
      const filtered = cats.filter(cat => cat.tipo.toUpperCase() === categoryType);
      setCategories(filtered);
    }
    loadCategories();
  }, []);

  return (
    <Dropdown>
      <Dropdown.Button flat color={categoryType=="RECEITA" ? "success" : "error"} css={{ tt: 'capitalize' }}>
        {selectedValue}
      </Dropdown.Button>
      <Dropdown.Menu
        aria-label="Seleção única de categoria"
        color={categoryType=="RECEITA" ? "success" : "error"}
        selectionMode="single"
        selectedKeys={selected}
        onSelectionChange={handleSelectionChange}
        id="categoria"
      >
        {categories.map(cat => (
          <Dropdown.Item key={cat.nome}>
            {cat.nome}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default CategoryDropdown;
