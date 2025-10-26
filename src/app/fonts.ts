import { Inter, Rubik, Unbounded } from 'next/font/google'

export const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
})

export const rubik = Rubik({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '700'],
  variable: '--font-rubik',
  display: 'swap',
})

export const unbounded = Unbounded({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-unbounded',
  display: 'swap',
})
