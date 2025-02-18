import React, { useState } from 'react';
import { Modal, Button, Loading, Text } from '@nextui-org/react';

const QuitarPagamentoModal = ({ pagamento, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const quitarPagamento = async () => {
    setLoading(true);

    try {
      const res = await fetch('/api/quitarPagamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idPagamento: pagamento.descricao,
        }),
      });

      if (res.ok) {
        onSuccess();
      } else {
        console.error('Erro ao quitar pagamento');
      }
    } catch (error) {
      console.error('Erro:', error);
    }
    setLoading(false);
  };

  return (
    <Modal closeButton open={true} onClose={onClose}>
      <Modal.Header>
        <Text b>Quitar Pagamento - {pagamento.descricao}</Text>
      </Modal.Header>
      <Modal.Body>
        <Text>Deseja quitar este pagamento?</Text>
      </Modal.Body>
      <Modal.Footer>
        <Button auto flat color="error" onPress={onClose}>
          Cancelar
        </Button>
        <Button auto color="warning" onPress={quitarPagamento} disabled={loading}>
          {loading ? <Loading size="sm" /> : "Quitar"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default QuitarPagamentoModal;
