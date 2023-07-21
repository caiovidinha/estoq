import mysql from 'mysql2/promise'

export default async function connect({ query,values = [] }) {
    const dbconnection = await mysql.createConnection({
        host:"cashflow-database.c8atbgo3ozsu.us-east-1.rds.amazonaws.com",
        user:"caiovidinha",
        password:"cashflow2023!#",
        database:"cashflow_db"
    })
    try {
        const [data] = await dbconnection.execute(query,values)
        dbconnection.end()
        return data
 
    } catch (error) {
        throw Error(error.message)
    }
}