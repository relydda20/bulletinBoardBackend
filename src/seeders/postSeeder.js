// seeders/postSeeder.js
import Post from "../models/Post.js";

const posts = [
  {
    title: "Getting Started with Node.js",
    content:
      "Node.js is a powerful JavaScript runtime built on Chrome's V8 engine. In this post, we'll explore the fundamentals of Node.js and why it's become so popular for server-side development. We'll cover asynchronous programming, the event loop, and building your first HTTP server.",
  },
  {
    title: "Introduction to MongoDB",
    content:
      "MongoDB is a NoSQL database that stores data in flexible, JSON-like documents. This makes it perfect for modern applications that need to scale quickly. Learn about collections, documents, and how MongoDB differs from traditional relational databases in this comprehensive guide.",
  },
  {
    title: "Express.js Best Practices",
    content:
      "Express.js is the most popular web framework for Node.js. In this article, we'll discuss best practices for structuring your Express applications, middleware usage, error handling, security considerations, and performance optimization techniques that every developer should know.",
  },
  {
    title: "Understanding REST APIs",
    content:
      "REST (Representational State Transfer) is an architectural style for building web services. This post covers the principles of REST, HTTP methods, status codes, and how to design clean, scalable APIs that follow REST conventions. We'll also look at common pitfalls to avoid.",
  },
  {
    title: "JavaScript ES6 Features",
    content:
      "ES6 brought significant improvements to JavaScript. Explore arrow functions, destructuring, spread operators, template literals, promises, and classes. These features make your code more concise and readable. We'll provide practical examples for each feature with real-world use cases.",
  },
  {
    title: "Building Scalable Microservices",
    content:
      "Microservices architecture breaks down applications into smaller, independent services. Learn about the benefits and challenges of microservices, how to design service boundaries, implement inter-service communication, and use tools like Docker and Kubernetes for deployment.",
  },
  {
    title: "Database Design Principles",
    content:
      "Good database design is crucial for application performance. This comprehensive guide covers normalization, indexing strategies, relationship modeling, query optimization, and when to denormalize for performance. We'll use practical examples from real-world applications.",
  },
  {
    title: "Authentication with JWT",
    content:
      "JSON Web Tokens (JWT) provide a stateless authentication mechanism for modern applications. Learn how JWTs work, how to implement secure authentication flows, token refresh strategies, and best practices for storing tokens on the client side securely.",
  },
  {
    title: "Async/Await in JavaScript",
    content:
      "Async/await syntax makes asynchronous code look and behave more like synchronous code. This tutorial explains promises, how async/await works under the hood, error handling with try/catch, and common patterns for working with multiple asynchronous operations efficiently.",
  },
  {
    title: "Testing Node.js Applications",
    content:
      "Testing is essential for maintaining code quality. Explore unit testing with Jest, integration testing for APIs, mocking dependencies, test coverage analysis, and setting up continuous integration. Learn how to write tests that are maintainable and provide real value.",
  },
];

export const seedPosts = async (users) => {
  try {
    console.log("🌱 Seeding posts...");

    if (!users || users.length === 0) {
      throw new Error("No users available for seeding posts");
    }

    // Assign posts to users (cycling through users if needed)
    const postsWithAuthors = posts.map((post, index) => ({
      ...post,
      author: users[index % users.length]._id,
    }));

    const createdPosts = await Post.insertMany(postsWithAuthors);
    console.log(`✅ Created ${createdPosts.length} posts`);

    return createdPosts;
  } catch (error) {
    console.error("❌ Error seeding posts:", error.message);
    throw error;
  }
};

export const clearPosts = async () => {
  try {
    const result = await Post.deleteMany({});
    console.log(`🗑️  Deleted ${result.deletedCount} posts`);
  } catch (error) {
    console.error("❌ Error clearing posts:", error.message);
    throw error;
  }
};
