import React from 'react'
import Header from '@/components/Header'
import QuickTransaction from '@/components/QuickTransaction'
import { FormOptionsProvider } from '@/contexts/FormOptionsContext'
import '@/styles/globals.css'

export default function App({ Component, pageProps }) {
    return (
        <FormOptionsProvider>
            <Header>
                <Component {...pageProps} />
                <QuickTransaction />
            </Header>
        </FormOptionsProvider>
    )
}
