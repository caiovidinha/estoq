import connect from '@/pages/api/dbconnect'

export default async function handler(req,res){
    if (req.method === "GET") {
        const fatura = await connect({
            query:"SELECT * from fatura",
            values: []
        })
        res.status(200).json({fatura: fatura})
    }

}