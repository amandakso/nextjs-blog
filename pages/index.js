import Head from "next/head";
import Layout, { siteTitle } from "../components/layout";
import utilStyles from "../styles/utils.module.css";
import { getPaginatedPosts } from "../lib/posts";
import PaginatedPosts from "../components/paginatedPage";

// export async function getStaticProps() {
//   const allPostsData = getSortedPostsData();
//   return {
//     props: {
//       allPostsData,
//     },
//   };
// }

export async function getServerSideProps({ query }) {
  const page = parseInt(query.page) || 1;
  const limit = 5; // Posts per page

  const { posts, pagination } = await getPaginatedPosts(page, limit);

  return {
    props: {
      posts,
      pagination,
    },
  };
}

export default function Home({ posts, pagination }) {
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        <p>
          Healthcare professional turned web developer. Foodie, book lover,
          novice crocheter, and perpetual wanderer.
        </p>
      </section>
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Blog Posts</h2>
        <PaginatedPosts posts={posts} pagination={pagination} />
      </section>
    </Layout>
  );
}

// export default function Home({ allPostsData }) {
//   return (
//     <Layout home>
//       <Head>
//         <title>{siteTitle}</title>
//       </Head>
//       <section className={utilStyles.headingMd}>
//         <p>
//           Healthcare professional turned web developer. Foodie, book lover,
//           novice crocheter, and perpetual wanderer.
//         </p>
//       </section>
//       <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
//         <h2 className={utilStyles.headingLg}>Blog Posts</h2>
//         <ul className={utilStyles.list}>
//           {allPostsData.map(({ id, date, title }) => (
//             <li className={utilStyles.listItem} key={id}>
//               <Link href={`/posts/${id}`}>{title}</Link>
//               <br />
//               <small className={utilStyles.lightText}>
//                 <Date dateString={date} />
//               </small>
//             </li>
//           ))}
//         </ul>
//       </section>
//     </Layout>
//   );
// }
