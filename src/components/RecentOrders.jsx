import React, {useState,useEffect} from 'react'
import { BsBoxSeam } from 'react-icons/bs'


const RecentOrders = () => {
  const [movimentacao,setMovimentacao] = useState([])

  async function getMovimentacao() {
    const postData = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
    const res = await fetch('http://localhost:3000/api/mov', 
    postData
    )
    const response = await res.json()
    setMovimentacao(response.movimentacoes)
  }
  
  useEffect(() => {
    getMovimentacao()
          
  })
  
  return (
    <div className="w-full col-span-1 relative lg:h-[70vh] h-[50vh] m-auto p-4 border rounded-lg bg-white overflow-scroll">
      <h1>Últimas movimentações</h1>
      <ul>
        {movimentacao.slice(0).reverse().map((mov,id) => (
          <li key={id} className='bg-gray-50 hover:bg-gray-100 rounded-lg my-3 p-2 flex items-center cursor-pointer'>
            <div className='bg-purple-100 rounded-lg p-3' >
            <BsBoxSeam className='text-purple-800'/>
            </div>
            <div className='pl-4'>
              <p className='text-gray-800 font-extrabold'>R$ {parseFloat(mov.valor).toFixed(2)}</p>
              <p className='text-gray-400 text-sm'>{mov.descricao}</p>
            </div>
            <p className='lg:flex md:hidden absolute right-6 text-sm'>
            {mov.data ? mov.data.toString().slice(5,7)+'/'+mov.data.toString().slice(8,10)+'/'+mov.data.toString().slice(0,4): ''}
            </p>
          </li>
        ))}
      </ul>

    </div>
  )
}

export default RecentOrders