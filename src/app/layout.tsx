import type { Metadata } from 'next'
import './globals.css'
import { AppProviders } from '../components/app-providers'
import { AppLayout } from '../components/app-layout'
import React from 'react'

export const metadata: Metadata = {
  title: 'Authensus',
  description: 'Created by Daniel Taylor',
}

const links: { label: string; path: string }[] = [
  { label: 'Collections', path: '/collection' },
  { label: 'Search', path: '/search' },
  { label: 'Account', path: '/account' },
  // { label: 'Clusters', path: '/clusters' },
]

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`antialiased`}>
        <AppProviders>
          <AppLayout links={links}>{children}</AppLayout>
        </AppProviders>
      </body>
    </html>
  )
}
// Patch BigInt so we can log it using JSON.stringify without any errors
declare global {
  interface BigInt {
    toJSON(): string
  }
}

BigInt.prototype.toJSON = function () {
  return this.toString()
}


/*
import './globals.css'
import {ClusterProvider} from '../components/cluster/cluster-data-access'
import {SolanaProvider} from '../components/solana/solana-provider'
import {UiLayout} from '../components/ui/ui-layout'
import {ReactQueryProvider} from './react-query-provider'

export const metadata = {
  title: 'Authensus',
  description: 'Developed by Daniel Taylor',
}

const links: { label: string; path: string }[] = [
  { label: 'Collections', path: '/collection' },
  { label: 'Search', path: '/search' },
  { label: 'Account', path: '/account' },
  { label: 'Clusters', path: '/clusters' },
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ReactQueryProvider>
          <ClusterProvider>
            <SolanaProvider>
              <UiLayout links={links}>{children}</UiLayout>
            </SolanaProvider>
          </ClusterProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
*/
