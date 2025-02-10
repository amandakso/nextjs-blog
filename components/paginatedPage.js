import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useRouter } from "next/router";
import Link from "next/link";
import Date from "./date";

const PaginatedPosts = ({ posts, pagination }) => {
  const router = useRouter();
  const { totalPages } = pagination;

  const columns = [
    {
      accessorKey: "title",
      cell: ({ row }) => (
        <Link
          href={`/posts/${row.original.id}`}
          className="hover:text-blue-600"
        >
          {row.original.title}
        </Link>
      ),
    },
    {
      accessorKey: "date",
      cell: ({ row }) => (
        <small className="text-gray-500">
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
    <div>
      <div className="mb-4">
        <p className="text-sm text-gray-600">
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

      <div className="mb-8">
        {table.getRowModel().rows.map((row) => (
          <div key={row.id} className="py-4 border-b">
            {flexRender(columns[0].cell, { row })}
            <br />
            {flexRender(columns[1].cell, { row })}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 rounded border disabled:opacity-50"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (pageNumber) => (
              <button
                key={pageNumber}
                className={`px-3 py-1 rounded border ${
                  pagination.currentPage === pageNumber
                    ? "bg-blue-500 text-white"
                    : "hover:bg-gray-100"
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
          <button
            className="px-3 py-1 rounded border disabled:opacity-50"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
