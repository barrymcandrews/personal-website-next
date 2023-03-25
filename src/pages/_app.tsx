import '../../styles/globals.scss';
import React from 'react';
import type { AppProps } from 'next/app';
import { Open_Sans, Montserrat, Source_Code_Pro } from 'next/font/google';
import Head from 'next/head';
import Footer from '../components/elements/Footer/Footer';
import dynamic from 'next/dynamic';

const GoogleAnalytics = dynamic(() => import('../components/GoogleAnalytics'), { ssr: false });

const montserrat = Montserrat({
  weight: ['700', '500', '300'],
  subsets: ['latin'],
  variable: '--font-montserrat'
});

const openSans = Open_Sans({
  weight: ['500', '700'],
  subsets: ['latin'],
  variable: '--font-open-sans'
});

const sourceCodePro = Source_Code_Pro({
  weight: '700',
  subsets: ['latin'],
  variable: '--font-source-code-pro'
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta charSet='utf-8' />
        <meta content='width=device-width, initial-scale=1' name='viewport' />
        <meta content='#ffffff' name='theme-color' />
        <meta
          content='Barry McAndrews is an accomplished Software Engineer with a passion for the cloud and home automation. Through his work at Vanguard, Barry has gained first-hand experience with cutting edge cloud technologies.'
          name='description'
        />
        <meta
          content='Barry McAndrews, Michael McAndrews, M Barry McAndrews, M. Barry McAndrews, Software Engineer, Computer Engineer, Engineer, Developer, Web Apps, Backend Engineer, Consultant, Contract, Freelance, Pittsburgh, Pitt, Vanguard'
          name='keywords'
        />
        <meta content='Barry McAndrews' name='author' />
        <title>Barry McAndrews - Software Engineer</title>
      </Head>
      <Component {...pageProps} />
      <Footer />
      <GoogleAnalytics />
    </>
  );
}
