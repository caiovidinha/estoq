import mysql from 'mysql2/promise'

export default async function handler(req,res){

    const dbconnection = await mysql.createConnection({
        host:"cashflow-database.c8atbgo3ozsu.us-east-1.rds.amazonaws.com",
        user:"caiovidinha",
        password:"cashflow2023!#",
        database:"cashflow_db"
    })
    try {
        const query = "SELECT * from movimentacoes"
        const values = []
        const [data] = await dbconnection.execute(query,values)
        dbconnection.end()
        res.status(200).json({ results: data })
 
    } catch (error) {
        // res.status(500).json({error: error.message})
    }

}