import React, { useState } from 'react';
import { Modal, Button, Input, Loading, Text } from '@nextui-org/react';
import { AiFillCheckCircle, AiFillCloseCircle } from 'react-icons/ai';
import { MdAdd } from 'react-icons/md';
import CategoryDropdown from '@/components/CategoryDropdown';
import { useMeses } from '@/hooks/useFormOptions';

const QuickTransaction = () => {
  const [visible, setVisible] = useState(false);
  const [tipo, setTipo] = useState('DESPESA');
  const [categoria, setCategoria] = useState('Categoria');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const { meses } = useMeses();

  const handler = () => setVisible(true);
  const closeHandler = () => {
    setVisible(false);
    setError(null);
    setSuccess(false);
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
    let valor = e.target.value;
    valor = valor.replace(/[\D]+/g, '');
    valor = parseFloat(valor);
    valor = valor + '';
    valor = valor.replace(/([0-9]{2})$/g, '.$1');
    e.target.value = valor;
    if (valor === 'NaN') e.target.value = '';
  };

  const handleSubmit = async () => {
    try {
      const valorInput = document.getElementById('valor-quick').value;
      const descricao = document.getElementById('descricao-quick').value;

      if (!categoria || categoria === 'Categoria' || !valorInput || !descricao) {
        setError('Preencha todos os campos');
        setTimeout(() => setError(null), 3000);
        return;
      }

      // Formatar valor
      let valorNumerico = valorInput.replace(/[\D]+/g, '');
      let valorDecimal = (parseFloat(valorNumerico) / 100).toFixed(2);
      let valorFormatado = tipo === 'DESPESA' 
        ? 'R$ -' + valorDecimal.replace('.', ',')
        : 'R$ ' + valorDecimal.replace('.', ',');

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
          {/* Tipo de Transação */}
          <div className="flex gap-2 mb-4">
            <Button
              auto
              color={tipo === 'DESPESA' ? 'error' : 'default'}
              onClick={() => setTipo('DESPESA')}
              css={{ flex: 1 }}
            >
              Despesa
            </Button>
            <Button
              auto
              color={tipo === 'RECEITA' ? 'success' : 'default'}
              onClick={() => setTipo('RECEITA')}
              css={{ flex: 1 }}
            >
              Receita
            </Button>
          </div>

          {/* Categoria */}
          <CategoryDropdown
            selectedValue={categoria}
            setSelectedValue={setCategoria}
            tipo={tipo}
          />

          {/* Valor */}
          <Input
            id="valor-quick"
            clearable
            bordered
            fullWidth
            color="primary"
            size="lg"
            placeholder="0.00"
            label="Valor"
            type="text"
            onChange={formatarMoeda}
            contentLeft={<span>R$</span>}
          />

          {/* Descrição */}
          <Input
            id="descricao-quick"
            clearable
            bordered
            fullWidth
            color="primary"
            size="lg"
            placeholder="Descrição da transação"
            label="Descrição"
            type="text"
          />

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
          <Button auto flat color="error" onClick={closeHandler}>
            Cancelar
          </Button>
          <Button auto onClick={handleSubmit} disabled={loading}>
            {loading ? <Loading size="sm" /> : 'Adicionar'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default QuickTransaction;
