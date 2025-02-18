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

  // Extract path components
  const pathParts = relativePath.split(path.sep);

  // Ensure all path-based properties have default values
  const postData = {
    id,
    mainCategory: pathParts[0] || null,
    subCategory: pathParts[1] || null,
    series: pathParts.length > 2 ? pathParts[2] : null,
    path: relativePath,
  };
  // Ensure all frontmatter data is serializable
  const frontmatterData = Object.entries(matterResult.data).reduce(
    (acc, [key, value]) => {
      acc[key] = value ?? null; // Convert undefined to null
      return acc;
    },
    {}
  );

  return {
    ...postData,
    ...frontmatterData,
  };
}

export async function getPaginatedPosts(page = 1, limit = 5, options = {}) {
  const { mainCategory, subCategory, series } = options;

  const allFiles = getAllMarkdownFiles(postsDirectory);
  let allPostsData = allFiles.map((fullPath) => getPostMetadata(fullPath));

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
    if (a.date < b.date) return 1;
    return -1;
  });

  // Calculate pagination
  const totalPosts = sortedPosts.length;
  const totalPages = Math.ceil(totalPosts / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  // Ensure all arrays in metadata contain only unique, non-null values
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

  return {
    posts: sortedPosts.slice(startIndex, endIndex),
    pagination: {
      currentPage: page,
      totalPages,
      totalPosts,
      postsPerPage: limit,
    },
    metadata,
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
