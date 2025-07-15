// Файл: pages/_document.tsx
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html>
      <Head>
        {/* Простой фавикон */}
        <link rel="icon" href="/favicon.ico" />

        {/* Метатеги для SEO */}
        <meta name="description" content="White Fin Capital - Professional financial research and market analysis" />
        <meta property="og:title" content="White Fin Capital" />
        <meta property="og:description" content="Navigate global markets with professional-grade analysis and data-driven insights" />
        <meta property="og:image" content="/logo.png" />
        <meta property="og:type" content="website" />
        <meta name="theme-color" content="#05192c" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}