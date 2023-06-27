import '../styles/globals.css'
import "antd/dist/antd.css";
import 'react-phone-number-input/style.css'
import "tailwindcss/tailwind.css";
import "../styles/login.scss";
import { Layout } from "antd";
import Head from "next/head";

function MyApp({ Component, pageProps }) {
  return (
    <Layout>
      <Head>
        <link rel="icon" href="/csi.png" />
        <title>CSI</title>
      </Head>
      <Component {...pageProps} />
    </Layout>
  )
}

export default MyApp
