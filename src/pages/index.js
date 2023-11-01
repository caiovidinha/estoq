import React from 'react'
import TopCards from '../components/TopCards'
import RecentOrders from '../components/RecentOrders'

export default function Home() {
    return (
        <main className={`bg-gray-100 min-h-screen`}>
            <TopCards />
            <div className="p-4 grid md:grid-cols-3 grid-cols-1 gap-4">
                <RecentOrders />
            </div>
        </main>
    )
}
