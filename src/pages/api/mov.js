import connect from '@/pages/api/dbconnect'

export default async function handler(req,res){
    if (req.method === "GET") {
        const movimentacoes = await connect({
            query:"SELECT * from movimentacoes",
            values: []
        })
        res.status(200).json({movimentacoes: movimentacoes})
    }

}