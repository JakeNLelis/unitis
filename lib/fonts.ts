import { Inter, Archivo, Erica_One } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

export const ericaOne = Erica_One({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-erica-one',
  display: 'swap',
});
