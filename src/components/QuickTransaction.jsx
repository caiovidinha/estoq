import React, { useState } from 'react';
import { Modal, Button, Loading, Text } from '@nextui-org/react';
import { AiFillCheckCircle, AiFillCloseCircle } from 'react-icons/ai';
import { MdAdd } from 'react-icons/md';
import CategoryDropdown from '@/components/CategoryDropdown';
import { useMeses } from '@/hooks/useFormOptions';

const QuickTransaction = () => {
  const [visible, setVisible] = useState(false);
  const [tipo, setTipo] = useState('DESPESA');
  const [categoria, setCategoria] = useState('Categoria');
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const { meses } = useMeses();

  const handler = () => setVisible(true);
  const closeHandler = () => {
    setVisible(false);
    setError(null);
    setSuccess(false);
    setValor('');
    setDescricao('');
    setCategoria('Categoria');
    setTipo('DESPESA');
  };

  // Obter data de hoje formatada
  const getDataHoje = () => {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  };

  // Obter mês atual
  const getMesAtual = () => {
    const hoje = new Date();
    const mesNum = String(hoje.getMonth() + 1).padStart(2, '0');
    const mesesNomes = [
      '01 - JANEIRO', '02 - FEVEREIRO', '03 - MARÇO', '04 - ABRIL',
      '05 - MAIO', '06 - JUNHO', '07 - JULHO', '08 - AGOSTO',
      '09 - SETEMBRO', '10 - OUTUBRO', '11 - NOVEMBRO', '12 - DEZEMBRO'
    ];
    return mesesNomes[parseInt(mesNum) - 1];
  };

  const formatarMoeda = (e) => {
    let v = e.target.value.replace(/[\D]+/g, '');
    if (!v) { setValor(''); return; }
    let num = parseFloat(v);
    let formatted = (num / 100).toFixed(2).replace('.', ',');
    setValor(formatted);
  };

  const handleSubmit = async () => {
    try {
      if (!categoria || categoria === 'Categoria' || !valor || !descricao) {
        setError('Preencha todos os campos');
        setTimeout(() => setError(null), 3000);
        return;
      }

      // Formatar valor para envio
      const valorDecimal = valor.replace(',', '.');
      let valorFormatado = tipo === 'DESPESA'
        ? '-' + valorDecimal
        : valorDecimal;

      // Data de hoje formatada para DD/MM/YYYY
      const hoje = new Date();
      const dia = String(hoje.getDate()).padStart(2, '0');
      const mes = String(hoje.getMonth() + 1).padStart(2, '0');
      const ano = hoje.getFullYear();
      const dataFormatada = `${dia}/${mes}/${ano}`;

      const transacao = {
        tipo: tipo,
        descritivo: categoria,
        valor: valorFormatado,
        data: dataFormatada,
        mes: getMesAtual(),
        detalhes: descricao,
        situacao: tipo === 'DESPESA' ? 'Pago' : 'Recebido',
        conta: 'Conta Nubank',
        fixa: false,
      };

      setLoading(true);
      setError(null);

      const response = await fetch('/api/transacoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transacao),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          closeHandler();
          window.location.reload();
        }, 1500);
      } else {
        setError(result.error || 'Erro ao criar transação');
      }
    } catch (err) {
      setError('Erro ao criar transação');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Botão Flutuante */}
      <button
        onClick={handler}
        className="fixed bottom-6 right-6 bg-purple-800 hover:bg-purple-900 text-white rounded-full p-4 shadow-lg z-50 transition-all duration-300 hover:scale-110"
        title="Adicionar transação rápida"
      >
        <MdAdd size={32} />
      </button>

      {/* Modal */}
      <Modal
        closeButton
        blur
        aria-labelledby="modal-title"
        open={visible}
        onClose={closeHandler}
        width="500px"
      >
        <Modal.Header>
          <Text id="modal-title" size={18} b>
            Transação Rápida
          </Text>
        </Modal.Header>
        <Modal.Body>
          {/* Toggle Despesa / Receita */}
          <div className="flex items-center justify-center mb-4">
            <span className={`text-sm font-semibold mr-3 transition-colors duration-300 ${tipo === 'DESPESA' ? 'text-red-500' : 'text-gray-400'}`}>
              Despesa
            </span>
            <button
              type="button"
              onClick={() => setTipo(tipo === 'DESPESA' ? 'RECEITA' : 'DESPESA')}
              className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none ${
                tipo === 'RECEITA' ? 'bg-green-500' : 'bg-red-500'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
                  tipo === 'RECEITA' ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-sm font-semibold ml-3 transition-colors duration-300 ${tipo === 'RECEITA' ? 'text-green-500' : 'text-gray-400'}`}>
              Receita
            </span>
          </div>

          {/* Categoria */}
          <CategoryDropdown
            selectedCategory={categoria}
            onSelect={setCategoria}
            categoryType={tipo}
          />

          {/* Valor */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Valor</label>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:border-purple-500">
              <span className="px-3 py-2 bg-gray-100 text-gray-600 border-r border-gray-300 text-sm">R$</span>
              <input
                className="flex-1 px-4 py-2 text-sm outline-none"
                placeholder="0,00"
                type="text"
                value={valor}
                onChange={formatarMoeda}
              />
            </div>
          </div>

          {/* Descrição */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Descrição</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-purple-500"
              placeholder="Descrição da transação"
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>

          {/* Informações Pré-definidas */}
          <div className="bg-gray-100 p-3 rounded-lg text-sm text-gray-700">
            <p><strong>Data:</strong> Hoje ({new Date().toLocaleDateString('pt-BR')})</p>
            <p><strong>Situação:</strong> {tipo === 'DESPESA' ? 'Pago' : 'Recebido'}</p>
            <p><strong>Mês:</strong> {getMesAtual()}</p>
            <p><strong>Conta:</strong> Conta Nubank</p>
            <p><strong>Fixa:</strong> Não</p>
          </div>

          {/* Mensagens de Erro e Sucesso */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-100 text-red-700 rounded-lg">
              <AiFillCloseCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-100 text-green-700 rounded-lg">
              <AiFillCheckCircle size={20} />
              <span>Transação criada com sucesso!</span>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button auto flat color="error" onPress={closeHandler}>
            Cancelar
          </Button>
          <Button auto onPress={handleSubmit} disabled={loading}>
            {loading ? <Loading size="sm" /> : 'Adicionar'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default QuickTransaction;
