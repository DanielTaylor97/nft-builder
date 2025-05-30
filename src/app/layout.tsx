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
