import React from 'react'
import Header from '@/components/Header'
import { FormOptionsProvider } from '@/contexts/FormOptionsContext'
import '@/styles/globals.css'

export default function App({ Component, pageProps }) {
    return (
        <FormOptionsProvider>
            <Header>
                <Component {...pageProps} />
            </Header>
        </FormOptionsProvider>
    )
}
