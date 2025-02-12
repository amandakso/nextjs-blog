import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useRouter } from "next/router";
import Link from "next/link";
import Date from "./date";
import styles from "./paginatedPage.module.css";

const PaginatedPosts = ({ posts, pagination }) => {
  const router = useRouter();
  const { totalPages } = pagination;

  const columns = [
    {
      accessorKey: "title",
      cell: ({ row }) => (
        <Link href={`/posts/${row.original.id}`} className={styles.postLink}>
          {row.original.title}
        </Link>
      ),
    },
    {
      accessorKey: "date",
      cell: ({ row }) => (
        <small className={styles.postDate}>
          <Date dateString={row.original.date} />
        </small>
      ),
    },
  ];

  const table = useReactTable({
    data: posts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    pageCount: totalPages,
    state: {
      pagination: {
        pageIndex: pagination.currentPage - 1,
        pageSize: pagination.postsPerPage,
      },
    },
    manualPagination: true,
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newPageIndex = updater({
          pageIndex: pagination.currentPage - 1,
          pageSize: pagination.postsPerPage,
        }).pageIndex;
        router.push({
          pathname: "/",
          query: { page: newPageIndex + 1 },
        });
      }
    },
  });

  return (
    <div className={styles.container}>
      <div className={styles.postCount}>
        <p>
          Showing{" "}
          {table.getState().pagination.pageSize * (pagination.currentPage - 1) +
            1}{" "}
          to{" "}
          {Math.min(
            table.getState().pagination.pageSize * pagination.currentPage,
            pagination.totalPosts
          )}{" "}
          of {pagination.totalPosts} posts
        </p>
      </div>

      <div className={styles.postsList}>
        {table.getRowModel().rows.map((row) => (
          <div key={row.id} className={styles.postItem}>
            {flexRender(columns[0].cell, { row })}
            <br />
            {flexRender(columns[1].cell, { row })}
          </div>
        ))}
      </div>

      <div className={styles.paginationContainer}>
        <button
          className={styles.button}
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </button>

        <div className={styles.numberContainer}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (pageNumber) => (
              <button
                key={pageNumber}
                className={`${styles.numberButton} ${
                  pagination.currentPage === pageNumber
                    ? styles.activeButton
                    : ""
                }`}
                onClick={() => {
                  router.push({
                    pathname: "/",
                    query: { page: pageNumber },
                  });
                }}
              >
                {pageNumber}
              </button>
            )
          )}
        </div>

        <button
          className={styles.button}
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PaginatedPosts;
