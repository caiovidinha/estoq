import connect from '@/pages/api/dbconnect'

export default async function handler(req,res){
    if (req.method === "GET") {
        const movimentacoes = await connect({
            query:"SELECT * from movimentacoes",
            values: []
        })
        res.status(200).json({movimentacoes: movimentacoes})
    }
    else if (req.method === "POST") {
        const tipo = req.body.tipo
        const categoria = req.body.categoria
        const valor = req.body.valor
        const data = req.body.data
        const descricao = req.body.descricao
        const status = req.body.status
        const conta = req.body.conta
        const cartao = null

        const addMovimentacoes = await connect({
            query: 'INSERT INTO movimentacoes (tipo, categoria, valor, data, descricao, status, conta, cartao) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            values: [tipo,categoria,valor,data,descricao,status,conta,cartao]
        })

        let movimentacao = {
            id: addMovimentacoes.insertId,
            tipo: tipo,
            categoria:categoria,
            valor:valor,
            data:data,
            descricao:descricao,
            status:status,
            conta:conta,
            cartao:cartao
        }
        res.status(200).json({movimentacao: movimentacao})
    }
}