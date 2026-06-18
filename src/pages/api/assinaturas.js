import { getRange, parseSheetData } from '@/lib/sheets';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const rawData = await getRange('Assinaturas!A:F');
    if (!rawData || rawData.length < 2) {
      return res.status(200).json({ success: true, data: [] });
    }
    const assinaturas = parseSheetData(rawData);
    return res.status(200).json({ success: true, data: assinaturas });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
