export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  console.log('=== SHORTCUT REQUEST ===');
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('========================');

  const { transaction } = req.body;

  if (!transaction) {
    return res.status(400).json({ error: 'Campo "transaction" é obrigatório' });
  }

  return res.status(200).json({
    received: true,
    transaction,
  });
}
