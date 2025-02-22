import Head from "next/head";
import Layout from "../../components/layout.js";
import utilStyles from "../../styles/utils.module.css";
import { getPaginatedPosts } from "../../lib/posts";
import PaginatedPosts from "../../components/paginatedPage";

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

export default function Posts({ posts, pagination, metadata }) {
  return (
    <Layout>
      <Head>
        <title>Blog Posts</title>
      </Head>
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Blog Posts</h2>
        <PaginatedPosts
          posts={posts}
          pagination={pagination}
          metadata={metadata}
          path="/posts"
        />
      </section>
    </Layout>
  );
}
