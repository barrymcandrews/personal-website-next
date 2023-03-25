import React from 'react';
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang='en'>
      <Head>
        <link href='/manifest.json' rel='manifest' />
        <link href='/images/web-192.png' rel='icon' sizes='192x192' type='image/png' />
        <link href='/images/web-128.png' rel='icon' sizes='128x128' type='image/png' />
        <link href='/images/web-96.png' rel='icon' sizes='96x96' type='image/png' />
        <link href='/images/web-32.png' rel='icon' sizes='32x32' type='image/png' />
        <link href='/images/web-16.png' rel='icon' sizes='16x16' type='image/png' />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
