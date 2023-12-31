import React from "react"
import Link from "next/link"
import { RxHamburgerMenu, RxDashboard, RxPerson } from 'react-icons/rx'
import { BsBoxSeam } from 'react-icons/bs'
import { FiSettings } from 'react-icons/fi'


const Sidebar = ({children}) => {
    return (
        <div className="flex">
            <div className="fixed w-20 h-screen p-4 bg-white border-r-[1px] flex flex-col justify-between">
                <div className="flex flex-col items-center ">
                    <Link href='/'>
                        <div className="bg-purple-800 text-slate-200 p-2 rounded-lg">
                            <RxHamburgerMenu size={25}/>
                        </div>
                    </Link>
                    <span className="border-b-[1px] border-gray-200 w-full p-2"></span>
                    <Link href='/'>
                        <div className="bg-gray-100 hover:bg-gray-200 cursor-pointer my-4 p-3 rounded-lg inline-block">
                            <RxDashboard size={25} />
                        </div>
                    </Link>
                    <Link href='/costumers'>
                        <div className="bg-gray-100 hover:bg-gray-200 cursor-pointer my-4 p-3 rounded-lg inline-block">
                            <RxPerson size={25} />
                        </div>
                    </Link>
                    <Link href='/orders'>
                        <div className="bg-gray-100 hover:bg-gray-200 cursor-pointer my-4 p-3 rounded-lg inline-block">
                            <BsBoxSeam size={25} />
                        </div>
                    </Link>
                    <Link href='/config'>
                        <div className="bg-gray-100 hover:bg-gray-200 cursor-pointer my-4 p-3 rounded-lg inline-block">
                            <FiSettings size={25} />
                        </div>
                    </Link>
                </div>
            </div>
            <main className="ml-20 w-full">{children}</main>
        </div>
    )
}

export default Sidebar