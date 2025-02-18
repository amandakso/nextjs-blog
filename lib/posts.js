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

  // Get relative path and normalize to forward slashes
  const relativePath = path
    .relative(postsDirectory, fullPath)
    .replace(/\\/g, "/");

  const id = relativePath.replace(/\.md$/, "");
  const pathParts = id.split("/");

  return {
    id,
    mainCategory: pathParts[0] || null,
    subCategory: pathParts[1] || null,
    series: pathParts.length > 2 ? pathParts[2] : null,
    ...matterResult.data,
  };
}

export async function getPaginatedPosts(page = 1, limit = 5, options = {}) {
  const { mainCategory, subCategory, series } = options;

  const allFiles = getAllMarkdownFiles(postsDirectory);
  let allPostsData = allFiles.map((fullPath) => {
    const postData = getPostMetadata(fullPath);
    // Ensure all post data properties are serializable
    return Object.entries(postData).reduce((acc, [key, value]) => {
      acc[key] = value ?? null; // Convert undefined to null
      return acc;
    }, {});
  });

  // Apply filters
  if (mainCategory) {
    allPostsData = allPostsData.filter(
      (post) => post.mainCategory === mainCategory
    );
  }
  if (subCategory) {
    allPostsData = allPostsData.filter(
      (post) => post.subCategory === subCategory
    );
  }
  if (series) {
    allPostsData = allPostsData.filter((post) => post.series === series);
  }

  // Sort posts by date
  const sortedPosts = allPostsData.sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    if (a.date < b.date) return 1;
    return -1;
  });

  // Calculate pagination
  const totalPosts = sortedPosts.length;
  const totalPages = Math.ceil(totalPosts / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  // Get metadata arrays and ensure no undefined values
  const metadata = {
    mainCategories: [
      ...new Set(allPostsData.map((post) => post.mainCategory).filter(Boolean)),
    ],
    subCategories: [
      ...new Set(allPostsData.map((post) => post.subCategory).filter(Boolean)),
    ],
    series: [
      ...new Set(allPostsData.map((post) => post.series).filter(Boolean)),
    ],
  };

  // Ensure the posts array is serializable
  const serializablePosts = sortedPosts
    .slice(startIndex, endIndex)
    .map((post) => {
      return Object.entries(post).reduce((acc, [key, value]) => {
        acc[key] = value ?? null;
        return acc;
      }, {});
    });

  return {
    posts: serializablePosts,
    pagination: {
      currentPage: page,
      totalPages,
      totalPosts,
      postsPerPage: limit,
    },
    metadata: metadata || { mainCategories: [], subCategories: [], series: [] },
  };
}

export function getAllPostIds() {
  const allFiles = getAllMarkdownFiles(postsDirectory);

  return allFiles.map((fullPath) => {
    // Get relative path and normalize to forward slashes
    const relativePath = path
      .relative(postsDirectory, fullPath)
      .replace(/\\/g, "/") // Convert Windows backslashes to forward slashes
      .replace(/\.md$/, ""); // Remove .md extension

    return {
      params: {
        id: relativePath,
      },
    };
  });
}

export async function getPostData(id) {
  // Ensure the id uses the correct path separator for the OS
  const normalizedId = id.replace(/\//g, path.sep);
  const fullPath = path.join(postsDirectory, `${normalizedId}.md`);

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const matterResult = matter(fileContents);

  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  // Return the id with forward slashes for URL consistency
  return {
    id: id,
    contentHtml,
    ...matterResult.data,
  };
}

// Category Utility Function
export function getCategoryStructure() {
  function readDirStructure(dir) {
    const result = {};
    const items = fs.readdirSync(dir);

    items.forEach((item) => {
      const fullPath = path.join(dir, item);
      if (fs.statSync(fullPath).isDirectory()) {
        result[item] = readDirStructure(fullPath);
      }
    });

    return result;
  }

  return readDirStructure(postsDirectory);
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
