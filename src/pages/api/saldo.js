import connect from '@/pages/api/dbconnect'

export default async function handler(req,res){
    if (req.method === "GET") {
        const saldo = await connect({
            query:"SELECT * from saldo",
            values: []
        })
        res.status(200).json({saldo: saldo})
    }

}