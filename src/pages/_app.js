import React from 'react'
import Header from '@/components/Header'
import QuickTransaction from '@/components/QuickTransaction'
import { FormOptionsProvider } from '@/contexts/FormOptionsContext'
import '@/styles/globals.css'

// Suppress React defaultProps deprecation warnings from NextUI v1 (library issue, not app code)
if (typeof window !== 'undefined') {
    const originalError = console.error
    console.error = (...args) => {
        if (typeof args[0] === 'string' && args[0].includes('defaultProps')) return
        originalError(...args)
    }
}

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
