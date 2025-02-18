import React, { useState } from 'react';
import { Modal, Button, Input, Loading, Text } from '@nextui-org/react';

const PagarParcelaModal = ({ pagamento, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [valor, setValor] = useState(pagamento.valorParcela);

  const pagarParcela = async () => {
    setLoading(true);

    try {
      const res = await fetch('/api/pagarParcela', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idPagamento: pagamento.descricao,
          valorPago: valor,
        }),
      });

      if (res.ok) {
        onSuccess();
      } else {
        console.error('Erro ao pagar parcela');
      }
    } catch (error) {
      console.error('Erro:', error);
    }
    setLoading(false);
  };

  return (
    <Modal closeButton open={true} onClose={onClose}>
      <Modal.Header>
        <Text b>Pagar Parcela - {pagamento.descricao}</Text>
      </Modal.Header>
      <Modal.Body>
        <Input label="Valor da Parcela" value={valor} onChange={(e) => setValor(e.target.value)} />
      </Modal.Body>
      <Modal.Footer>
        <Button auto flat color="error" onPress={onClose}>
          Cancelar
        </Button>
        <Button auto color="success" onPress={pagarParcela} disabled={loading}>
          {loading ? <Loading size="sm" /> : "Pagar"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PagarParcelaModal;
