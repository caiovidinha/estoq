import React, { useState, useEffect } from 'react';
import { BsThreeDots } from 'react-icons/bs';
import {
  BiRestaurant,
  BiCar,
  BiPhone,
  BiSolidTShirt,
  BiCreditCardAlt,
  BiBomb,
  BiSmile,
  BiGift,
  BiMoneyWithdraw,
} from 'react-icons/bi';
import { MdMoneyOff } from 'react-icons/md';
import { GiWeightLiftingUp, GiHealthNormal } from 'react-icons/gi';
import { SiBetfair, SiFreelancer, SiYourtraveldottv } from 'react-icons/si';
import { AiOutlineTool } from 'react-icons/ai';
import { RiFundsBoxLine, RiBillLine } from 'react-icons/ri';
import { Mov } from './Mov';

const FULL_URL_MOV = 'https://docs.google.com/spreadsheets/d/1kusPEM4OdchOyHp7Coa7MfB0Nnq3SUqWCxH0PGW5ldE/gviz/tq?sheet=Extrato&range=A:H';
const FULL_URL_CATS = 'https://docs.google.com/spreadsheets/d/1kusPEM4OdchOyHp7Coa7MfB0Nnq3SUqWCxH0PGW5ldE/gviz/tq?sheet=Categories&range=A2:C';

// Objeto que mapeia a string para o componente do ícone
const IconComponents = {
  BiRestaurant,
  BiCar,
  BiPhone,
  BiSolidTShirt,
  BiCreditCardAlt,
  BiBomb,
  BiSmile,
  BiGift,
  BiMoneyWithdraw,
  MdMoneyOff,
  GiWeightLiftingUp,
  GiHealthNormal,
  SiBetfair,
  SiFreelancer,
  SiYourtraveldottv,
  AiOutlineTool,
  RiFundsBoxLine,
  RiBillLine,
  BsThreeDots,
};

// Função para retornar o ícone para cada movimentação de forma dinâmica  
function getIconForMovimentacao(mov, categoriesMapping) {
  // Aqui usamos mov.descritivo para procurar a categoria.
  // Se você tiver uma coluna específica (ex.: mov.categoria), use-a.
  const catFound = categoriesMapping.find(
    (cat) =>
      cat.nome.trim().toLowerCase() === mov.descritivo.trim().toLowerCase()
  );
  const iconName = catFound ? catFound.icone : 'BsThreeDots';
  const IconComponent = IconComponents[iconName] || BsThreeDots;
  const colorClass = mov.tipo.toUpperCase() === 'RECEITA' ? 'text-green-800' : 'text-red-800';
  return <IconComponent size={20} className={colorClass} />;
}

const RecentOrders = () => {
  const [mov, setMov] = useState([]);
  const [categoriesMapping, setCategoriesMapping] = useState([]);

  // Carrega as movimentações
  useEffect(() => {
    fetch(FULL_URL_MOV)
      .then((res) => res.text())
      .then((rep) => {
        let data = JSON.parse(rep.substr(47).slice(0, -2));
        let produto = new Mov();
        for (let i = 0; i < data.table.rows.length; i++) {
          produto.salvar(
            i + 3,
            data.table.rows[i].c[0]?.v, // tipo
            data.table.rows[i].c[1]?.v, // descritivo (aqui deve conter o nome da categoria)
            data.table.rows[i].c[2]?.v.toFixed(2),
            data.table.rows[i].c[3]?.v,
            data.table.rows[i].c[4]?.v,
            data.table.rows[i].c[5]?.v,
            data.table.rows[i].c[6]?.v,
            data.table.rows[i].c[7]?.v
          );
        }
        setMov(produto.arrayMov);
      })
      .catch((err) => console.error('Erro ao carregar movimentações:', err));
  }, []);

  // Carrega o mapeamento de categorias
  useEffect(() => {
    fetch(FULL_URL_CATS)
      .then((res) => res.text())
      .then((rep) => {
        const data = JSON.parse(rep.substr(47).slice(0, -2));
        let cats = [];
        for (let i = 0; i < data.table.rows.length; i++) {
          const row = data.table.rows[i].c;
          const nome = row[0]?.v || '';
          const tipo = row[1]?.v || '';
          const icone = row[2]?.v || 'BsThreeDots';
          cats.push({ nome, tipo, icone });
        }
        setCategoriesMapping(cats);
      })
      .catch((err) => console.error('Erro ao carregar categorias:', err));
  }, []);

  return (
    <div className="w-full col-span-3 relative lg:h-[70vh] h-[50vh] m-auto p-4 border rounded-lg bg-white overflow-scroll">
      <ul>
        {mov
          .slice(0)
          .reverse()
          .map((mov, id) => (
            <li
              key={mov.id}
              className="bg-gray-50 rounded-lg my-3 p-2 flex items-center cursor-pointer"
            >
              <div className="flex items-center">
                <div
                  className={
                    mov.tipo.toUpperCase() === 'RECEITA'
                      ? 'bg-green-200 rounded-lg p-3'
                      : 'bg-red-200 rounded-lg p-3'
                  }
                >
                  {getIconForMovimentacao(mov, categoriesMapping)}
                </div>
                <div className="pl-4">
                  <p className="text-gray-800 font-extrabold">
                    R$ {parseFloat(mov.valor).toFixed(2).replace('.', ',')}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {mov.detalhes ? `${mov.detalhes} - ` : ''}{mov.conta}{mov.cartao ? ` - ${mov.cartao}` : ''}
                  </p>
                </div>
              </div>
              <p className="lg:flex md:hidden absolute mb-7 right-6 text-sm">
                {mov.data}
              </p>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default RecentOrders;
