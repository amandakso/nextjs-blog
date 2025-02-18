import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const postsDirectory = path.join(process.cwd(), "posts");

// Recursively get all markdown files from nested directories
function getAllMarkdownFiles(dir) {
  let results = [];
  const items = fs.readdirSync(dir);

  items.forEach((item) => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      results = results.concat(getAllMarkdownFiles(fullPath));
    } else if (item.endsWith(".md")) {
      results.push(fullPath);
    }
  });

  return results;
}

function getPostMetadata(fullPath) {
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const matterResult = matter(fileContents);

  // Get relative path from posts directory
  const relativePath = path.relative(postsDirectory, fullPath);
  // Remove .md extension
  const id = relativePath.replace(/\.md$/, "");
  // Extract category from path (first directory in the path)
  const category = relativePath.split(path.sep)[0];
  // Extract year from path if it exists (second directory in the path)
  const pathParts = relativePath.split(path.sep);
  const year = pathParts.length > 2 ? pathParts[1] : null;

  return {
    id,
    category,
    year,
    fullPath,
    ...matterResult.data,
  };
}

export async function getPaginatedPosts(
  page = 1,
  limit = 5,
  category = null,
  year = null
) {
  const allFiles = getAllMarkdownFiles(postsDirectory);

  let allPostsData = allFiles.map((fullPath) => getPostMetadata(fullPath));

  // Filter by category and year if provided
  if (category) {
    allPostsData = allPostsData.filter((post) => post.category === category);
  }
  if (year) {
    allPostsData = allPostsData.filter((post) => post.year === year);
  }

  // Sort posts by date
  const sortedPosts = allPostsData.sort((a, b) => {
    if (a.date < b.date) return 1;
    return -1;
  });

  // Calculate pagination values
  const totalPosts = sortedPosts.length;
  const totalPages = Math.ceil(totalPosts / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  return {
    posts: sortedPosts.slice(startIndex, endIndex),
    pagination: {
      currentPage: page,
      totalPages,
      totalPosts,
      postsPerPage: limit,
    },
    metadata: {
      categories: [...new Set(allPostsData.map((post) => post.category))],
      years: [
        ...new Set(allPostsData.map((post) => post.year).filter(Boolean)),
      ],
    },
  };
}

export function getAllPostIds() {
  const allFiles = getAllMarkdownFiles(postsDirectory);

  return allFiles.map((fullPath) => {
    const relativePath = path.relative(postsDirectory, fullPath);
    return {
      params: {
        id: relativePath.replace(/\.md$/, "").split(path.sep),
      },
    };
  });
}

export async function getPostData(id) {
  // Join id parts if it's an array (from nested path)
  const idPath = Array.isArray(id) ? path.join(...id) : id;
  const fullPath = path.join(postsDirectory, `${idPath}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  const matterResult = matter(fileContents);
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  const metadata = getPostMetadata(fullPath);

  return {
    ...metadata,
    contentHtml,
  };
}

// Utility functions for category and year management
export function getCategories() {
  return fs
    .readdirSync(postsDirectory)
    .filter((item) =>
      fs.statSync(path.join(postsDirectory, item)).isDirectory()
    );
}

export function getYearsForCategory(category) {
  const categoryPath = path.join(postsDirectory, category);
  if (!fs.existsSync(categoryPath)) return [];

  return fs
    .readdirSync(categoryPath)
    .filter((item) => fs.statSync(path.join(categoryPath, item)).isDirectory())
    .filter((item) => /^\d{4}$/.test(item)); // Only include items that are 4-digit years
}

// export async function getPaginatedPosts(page = 1, limit = 5) {
//   // Get file names under /posts
//   const fileNames = fs.readdirSync(postsDirectory);
//   const allPostsData = fileNames.map((fileName) => {
//     const id = fileName.replace(/\.md$/, "");
//     const fullPath = path.join(postsDirectory, fileName);
//     const fileContents = fs.readFileSync(fullPath, "utf8");
//     const matterResult = matter(fileContents);

//     return {
//       id,
//       ...matterResult.data,
//     };
//   });

//   // Sort posts by date
//   const sortedPosts = allPostsData.sort((a, b) => {
//     if (a.date < b.date) {
//       return 1;
//     } else {
//       return -1;
//     }
//   });

//   // Calculate pagination values
//   const totalPosts = sortedPosts.length;
//   const totalPages = Math.ceil(totalPosts / limit);
//   const startIndex = (page - 1) * limit;
//   const endIndex = startIndex + limit;

//   // Get only the posts for the current page
//   const paginatedPosts = sortedPosts.slice(startIndex, endIndex);

//   return {
//     posts: paginatedPosts,
//     pagination: {
//       currentPage: page,
//       totalPages,
//       totalPosts,
//       postsPerPage: limit,
//     },
//   };
// }

// export function getSortedPostsData() {
//   // Get file names under /posts
//   const fileNames = fs.readdirSync(postsDirectory);
//   const allPostsData = fileNames.map((fileName) => {
//     // Remove ".md" from file name to get id
//     const id = fileName.replace(/\.md$/, "");

//     // Read markdown file as string
//     const fullPath = path.join(postsDirectory, fileName);
//     const fileContents = fs.readFileSync(fullPath, "utf8");

//     // Use gray-matter to parse the post metadata section
//     const matterResult = matter(fileContents);

//     // Combine the data with the id
//     return {
//       id,
//       ...matterResult.data,
//     };
//   });
//   // Sort posts by date
//   return allPostsData.sort((a, b) => {
//     if (a.date < b.date) {
//       return 1;
//     } else {
//       return -1;
//     }
//   });
// }

// export function getAllPostIds() {
//   const fileNames = fs.readdirSync(postsDirectory);

//   // Returns an array that looks like this:
//   // [
//   //   {
//   //     params: {
//   //       id: 'ssg-ssr'
//   //     }
//   //   },
//   //   {
//   //     params: {
//   //       id: 'pre-rendering'
//   //     }
//   //   }
//   // ]
//   return fileNames.map((fileName) => {
//     return {
//       params: {
//         id: fileName.replace(/\.md$/, ""),
//       },
//     };
//   });
// }

// export async function getPostData(id) {
//   const fullPath = path.join(postsDirectory, `${id}.md`);
//   const fileContents = fs.readFileSync(fullPath, "utf8");

//   // Use gray-matter to parse the post metadata section
//   const matterResult = matter(fileContents);

//   // Use remark to convert markdown into HTML string
//   const processedContent = await remark()
//     .use(html)
//     .process(matterResult.content);
//   const contentHtml = processedContent.toString();

//   // Combine the data with the id
//   return {
//     id,
//     contentHtml,
//     ...matterResult.data,
//   };
// }
