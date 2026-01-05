import { React, useState, useMemo, useEffect } from 'react';
import {
  Modal,
  Button,
  Text,
  Input,
  Dropdown,
  Loading,
} from '@nextui-org/react';
import { GiReceiveMoney } from 'react-icons/gi';
import { useCartoes } from '@/hooks/useFormOptions';
// REMOVIDO: import { updateLimiteCartao, getCartoes } from '@/services/api';

const AddIncomeModalCredito = () => {
  const [loading, setLoading] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [visible, setVisible] = useState(false);

  // Hook para buscar cartões do Context
  const { cartoes, loading: cartoesLoading } = useCartoes();

  // Estado para seleção do cartão e novo limite
  const [selectedAccount, setSelectedAccount] = useState(new Set(['Selecionar']));
  const selectedValueAccount = useMemo(
    () => Array.from(selectedAccount).join(', ').replaceAll('_', ' '),
    [selectedAccount]
  );
  const [newLimit, setNewLimit] = useState('');

  const openModal = () => setVisible(true);
  const closeModal = () => setVisible(false);

  // Função para formatar o valor no input
  const formatarMoeda = () => {
    var elemento = document.getElementById('newLimit')
    var valor = elemento.value

    valor = valor + ''
    valor = parseFloat(valor.replace(/[\D]+/g, ''))
    valor = valor + ''
    valor = valor.replace(/([0-9]{2})$/g, '.$1')

    elemento.value = valor
    if (valor === 'NaN') elemento.value = ''
}

  // Atualizar accounts quando cartoes do Context mudar
  useEffect(() => {
    if (cartoes && cartoes.length > 0) {
      const accountsArray = cartoes.map((cartao) => ({
        id: cartao,
        cartao: cartao,
        limite: 0 // TODO: ajustar quando API retornar limite
      }));
      setAccounts(accountsArray);
    }
  }, [cartoes]);

  // Função para enviar a atualização do limite via endpoint interno
  const updateLimit = async () => {
    if (selectedValueAccount === 'Selecionar') {
      return;
    }
    setNewLimit(parseFloat(document.getElementById("newLimit").value.replace(".",",")))
    setLoading(true);
    
    try {
      // TODO: Implementar updateLimiteCartao com nova API
      console.warn('updateLimiteCartao() precisa ser implementado')
      // await updateLimiteCartao(selectedValueAccount, newLimit);
      setUpdated(true);
    } catch (error) {
      console.error('Erro ao atualizar o limite:', error);
      alert('Erro ao atualizar o limite: ' + error.message);
    }
    setLoading(false);
    // Opcional: reset do formulário ou refetch dos dados
  };

  return (
    <div className="sm:-ml-2 sm:mr-4 ml-3 mr-2">
      {/* Botão circular com ícone, mantendo o mesmo estilo original */}
      <Button
                      className="bg-green-200 flex justify-center items-center mt-2 rounded-full h-10 w-10 sm:-ml-3 -ml-5 z-10"
                      auto
                      rounded
                      shadow
                      color="green"
                      onPress={openModal}
                      icon={<GiReceiveMoney className="text-green-800" size={20} />}
                  ></Button>
      <Modal closeButton open={visible} onClose={closeModal}>
        <Modal.Header>
          <Text id="modal-title" size={18}>
            Atualizar Limite do Cartão
          </Text>
        </Modal.Header>
        <Modal.Body>
          <Dropdown>
            <Dropdown.Button flat css={{ tt: 'capitalize' }}>
              {selectedValueAccount === 'Selecionar'
                ? 'Selecionar Cartão'
                : accounts.find(acc => acc.id.toString() === selectedValueAccount)?.cartao}
            </Dropdown.Button>
            <Dropdown.Menu
              aria-label="Selecione o Cartão"
              selectionMode="single"
              selectedKeys={selectedAccount}
              onSelectionChange={(keys) => setSelectedAccount(keys)}
            >
              {accounts.map((account) => (
                <Dropdown.Item key={account.id.toString()}>
                  {account.cartao} (Limite Atual: {account.limite})
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
          <Input
            bordered
            fullWidth
            labelLeft="R$"
            color="primary"
            size="lg"
            id="newLimit"
            placeholder="Novo Limite (ex: 500,00)"
            onKeyUp={formatarMoeda}

            className="mt-2"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button auto flat color="error" onPress={closeModal}>
            Fechar
          </Button>
          <Button auto color="success" onPress={updateLimit}>
            {loading ? (
              <Loading type="spinner" color="white" size="sm" />
            ) : (
              'Atualizar'
            )}
          </Button>
          {updated && (
            <Text color="success" className="ml-2">
              Limite atualizado!
            </Text>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AddIncomeModalCredito;
