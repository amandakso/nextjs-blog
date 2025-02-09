import Head from "next/head";
import Layout, { siteTitle } from "../components/layout";
import utilStyles from "../styles/utils.module.css";
import Link from "next/link";
import Date from "../components/date";
import { useRouter } from "next/router";
import { getPaginatedPosts } from "../lib/posts";

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
  const router = useRouter();
  const { currentPage, totalPages, totalPosts, postsPerPage } = pagination;

  const handlePageChange = (newPage) => {
    router.push({
      pathname: "/",
      query: { page: newPage },
    });
  };

  // Generate visible page numbers with ellipsis
  const getPageNumbers = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    const rangeWithDots = [1];
    if (range[0] > 2) {
      rangeWithDots.push("...");
    }
    rangeWithDots.push(...range);
    if (range[range.length - 1] < totalPages - 1) {
      rangeWithDots.push("...");
    }
    if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

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

        {/* Posts count display */}
        <p className="text-sm text-gray-600 mb-4">
          Showing posts {(currentPage - 1) * postsPerPage + 1}-
          {Math.min(currentPage * postsPerPage, totalPosts)} of {totalPosts}
        </p>

        <ul className={utilStyles.list}>
          {posts.map(({ id, date, title }) => (
            <li className={utilStyles.listItem} key={id}>
              <Link href={`/posts/${id}`}>{title}</Link>
              <br />
              <small className={utilStyles.lightText}>
                <Date dateString={date} />
              </small>
            </li>
          ))}
        </ul>

        {/* Pagination Controls */}
        <div className="flex justify-center items-center space-x-2 mt-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded ${
              currentPage === 1
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            Previous
          </button>

          <div className="flex space-x-1">
            {getPageNumbers().map((number, index) =>
              number === "..." ? (
                <span key={`ellipsis-${index}`} className="px-3 py-1">
                  ...
                </span>
              ) : (
                <button
                  key={number}
                  onClick={() => handlePageChange(number)}
                  className={`px-3 py-1 rounded ${
                    currentPage === number
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  {number}
                </button>
              )
            )}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded ${
              currentPage === totalPages
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            Next
          </button>
        </div>
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
