import React, { useState, useEffect } from 'react';
import { Button, Modal, Table, Text } from '@nextui-org/react';
import { CiCirclePlus } from "react-icons/ci";
import PagarParcelaModal from '@/components/PagarParcelaModal';
import QuitarPagamentoModal from '@/components/QuitarPagamentoModal';

const PagamentosPage = () => {
  const [pagamentos, setPagamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPagamento, setSelectedPagamento] = useState(null);
  const [showPagarModal, setShowPagarModal] = useState(false);
  const [showQuitarModal, setShowQuitarModal] = useState(false);

  const SHEET_ID = '1kusPEM4OdchOyHp7Coa7MfB0Nnq3SUqWCxH0PGW5ldE';
  const FULL_URL_PAGAMENTOS = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=Pagamentos&range=A:K`;

  useEffect(() => {
    loadPagamentos();
  }, []);

  const loadPagamentos = async () => {
    setLoading(true);
    try {
      const res = await fetch(FULL_URL_PAGAMENTOS);
      const text = await res.text();
      const data = JSON.parse(text.substr(47).slice(0, -2));
      let lista = [];

      for (let i = 0; i < data.table.rows.length; i++) {
        const row = data.table.rows[i].c;
        const dataStr = row[10]?.v || '';
        const match = dataStr.match(/Date\((\d+),(\d+),(\d+)\)/);

        const anoData = match[1];
        const mesData = String(Number(match[2]) + 1).padStart(2, '0');
        const diaData = String(match[3]).padStart(2, '0');
        const dataFinal = `${diaData}/${mesData}/${anoData}`
    
        lista.push({
          tipo: row[0]?.v || '',
          descricao: row[1]?.v || '',
          valorTotal: row[2]?.v || '0',
          valorParcela: row[3]?.v || '0',
          valorQuitacao: row[4]?.v || '-',
          detalhes: row[5]?.v || '',
          pagas: row[6]?.v || '0',
          parcelas: row[7]?.v || '0',
          situacao: row[8]?.v || '',
          ultimoPag: row[9]?.v || '-',
          proxPag: dataFinal,
        });
      }

      setPagamentos(lista);
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
    }
    setLoading(false);
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <title>Pagamentos - CF</title>
      <h2 className="text-2xl font-semibold text-blue-800 mb-4">Gerenciamento de Pagamentos</h2>

      {loading ? (
        <Text>Carregando pagamentos...</Text>
      ) : (
        <Table aria-label="Lista de Pagamentos" className='z-10'>
          <Table.Header>
            <Table.Column>DESCRITIVO</Table.Column>
            <Table.Column>VALOR TOTAL</Table.Column>
            <Table.Column>VALOR PARCELA</Table.Column>
            <Table.Column>RECEBIDAS/PAGAS</Table.Column>
            <Table.Column>PRÓX. PAG.</Table.Column>
            <Table.Column>AÇÕES</Table.Column>
          </Table.Header>
          <Table.Body>
            {pagamentos.map((p, index) => (
              <Table.Row key={index}>
                <Table.Cell>{p.descricao}</Table.Cell>
                <Table.Cell>R$ {p.valorTotal.toString().replace(".",",")}</Table.Cell>
                <Table.Cell>R$ {p.valorParcela.toString().replace(".",",")}</Table.Cell>
                <Table.Cell>{p.pagas}/{p.parcelas}</Table.Cell>
                <Table.Cell>{p.proxPag}</Table.Cell>
                <Table.Cell>
                  <div className="flex gap-2">
                    <Button size="xs" color="success" onClick={() => { setSelectedPagamento(p); setShowPagarModal(true); }}>
                      Pagar Parcela
                    </Button>
                    <Button size="xs" color="warning" onClick={() => { setSelectedPagamento(p); setShowQuitarModal(true); }}>
                      Quitar
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}

      {showPagarModal && (
        <PagarParcelaModal
          pagamento={selectedPagamento}
          onClose={() => setShowPagarModal(false)}
          onSuccess={() => { loadPagamentos(); setShowPagarModal(false); }}
        />
      )}

      {showQuitarModal && (
        <QuitarPagamentoModal
          pagamento={selectedPagamento}
          onClose={() => setShowQuitarModal(false)}
          onSuccess={() => { loadPagamentos(); setShowQuitarModal(false); }}
        />
      )}
    </div>
  );
};

export default PagamentosPage;
