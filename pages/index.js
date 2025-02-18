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
  try {
    const page = parseInt(query.page) || 1;
    const limit = 5; // Posts per page

    const { posts, pagination, metadata } = await getPaginatedPosts(
      page,
      limit
    );

    // Ensure all data is serializable
    return {
      props: {
        posts: posts || [],
        pagination: pagination || {
          currentPage: 1,
          totalPages: 0,
          totalPosts: 0,
          postsPerPage: limit,
        },
        metadata: metadata || {
          mainCategories: [],
          subCategories: [],
          series: [],
        },
      },
    };
  } catch (error) {
    console.error("Error in getServerSideProps:", error);
    return {
      props: {
        posts: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalPosts: 0,
          postsPerPage: 5,
        },
        metadata: {
          mainCategories: [],
          subCategories: [],
          series: [],
        },
      },
    };
  }
}

export default function Home({ posts, pagination, metadata }) {
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
        <PaginatedPosts
          posts={posts}
          pagination={pagination}
          metadata={metadata}
        />
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
