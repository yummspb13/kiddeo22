import type { AppProps } from 'next/app'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import { ToastContainer } from '@/components/Toast'
import '@/app/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <CartProvider>
        <Component {...pageProps} />
        <ToastContainer />
      </CartProvider>
    </AuthProvider>
  )
}
