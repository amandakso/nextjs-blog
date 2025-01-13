import Head from "next/head";
import Layout, { siteTitle } from "../components/layout";
import utilStyles from "../styles/utils.module.css";

export default function Home() {
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        <p>
          Hi, I'm Amanda, a healthcare professional turned self-taught software
          engineer.
        </p>
        <p>
          (This is a sample website built using a{" "}
          <a href="https://nextjs.org/learn-pages-router/basics/create-nextjs-app">
            Next.js tutorial
          </a>
          .)
        </p>
      </section>
    </Layout>
  );
}
