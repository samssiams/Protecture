// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        {/* You can add other meta tags here, but no viewport meta tag */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
