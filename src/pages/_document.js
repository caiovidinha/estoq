import React from 'react'
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
    return (
        <Html lang="pt">
            <Head>
                {/* PWA primary color */}
                <meta name="theme-color" content="#ffffff" />
                
                {/* PWA manifest */}
                <link rel="manifest" href="/manifest.json" />
                
                {/* PWA meta tags */}
                <meta name="application-name" content="Estoq" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content="Estoq" />
                <meta name="description" content="Sistema de controle financeiro e movimentações" />
                <meta name="format-detection" content="telephone=no" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="msapplication-config" content="/browserconfig.xml" />
                <meta name="msapplication-TileColor" content="#ffffff" />
                <meta name="msapplication-tap-highlight" content="no" />
                
                {/* Apple touch icons */}
                <link rel="apple-touch-icon" href="/icons/ios/152.png" />
                <link rel="apple-touch-icon" sizes="120x120" href="/icons/ios/120.png" />
                <link rel="apple-touch-icon" sizes="152x152" href="/icons/ios/152.png" />
                <link rel="apple-touch-icon" sizes="180x180" href="/icons/ios/180.png" />
                <link rel="apple-touch-icon" sizes="167x167" href="/icons/ios/167.png" />
                
                {/* Favicons */}
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon.ico" />
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon.ico" />
                <link rel="shortcut icon" href="/favicon.ico" />
                
                {/* Twitter */}
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content="Estoq" />
                <meta name="twitter:description" content="Sistema de controle financeiro" />
                <meta name="twitter:image" content="/icons/android/android-launchericon-192-192.png" />
                
                {/* Open Graph */}
                <meta property="og:type" content="website" />
                <meta property="og:title" content="Estoq" />
                <meta property="og:description" content="Sistema de controle financeiro" />
                <meta property="og:site_name" content="Estoq" />
                <meta property="og:image" content="/icons/android/android-launchericon-512-512.png" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}
