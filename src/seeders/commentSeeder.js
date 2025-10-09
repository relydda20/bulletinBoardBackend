import Comment from "../models/Comment.js";

const commentTemplates = [
  "Great post! This really helped me understand the concept better.",
  "Thanks for sharing this information. Very useful!",
  "I have a question about this approach. Could you elaborate more?",
  "This is exactly what I was looking for. Appreciate the detailed explanation.",
  "Interesting perspective. I hadn't thought about it this way before.",
  "Could you provide more examples of this in practice?",
  "Well written article. Looking forward to more content like this.",
  "I implemented this in my project and it works perfectly. Thanks!",
  "This helped me solve a problem I've been struggling with for days.",
  "Great tutorial! Very clear and easy to follow.",
  "I disagree with some points, but overall a good read.",
  "Can you recommend any additional resources on this topic?",
  "This is a game changer for my workflow. Thank you!",
  "I've bookmarked this for future reference.",
  "Excellent breakdown of the topic. Very thorough.",
];

const replyTemplates = [
  "Thanks for your feedback! Glad it helped.",
  "Good question! Let me explain further...",
  "I appreciate your input. You make a valid point.",
  "Thanks for reading! I'll consider writing more on this topic.",
  "Great to hear it worked for you!",
  "That's an interesting observation. Thanks for sharing!",
];

export const seedComments = async (users, posts) => {
  try {
    console.log("🌱 Seeding comments...");

    if (!users || users.length === 0) {
      throw new Error("No users available for seeding comments");
    }

    if (!posts || posts.length === 0) {
      throw new Error("No posts available for seeding comments");
    }

    const comments = [];

    // Create 2-4 parent comments per post
    for (const post of posts) {
      const numComments = Math.floor(Math.random() * 3) + 2; // 2-4 comments

      for (let i = 0; i < numComments; i++) {
        // Any user can comment, including the post author
        const randomUser = users[Math.floor(Math.random() * users.length)];

        comments.push({
          post: post._id,
          author: randomUser._id,
          content:
            commentTemplates[
              Math.floor(Math.random() * commentTemplates.length)
            ],
          parentComment: null,
        });
      }
    }

    const createdComments = await Comment.insertMany(comments);
    console.log(`✅ Created ${createdComments.length} parent comments`);

    // Create replies - anyone can reply, including themselves
    const replies = [];

    for (const comment of createdComments) {
      // 40% chance of getting a reply
      if (Math.random() > 0.4) continue;

      // Any random user can reply (including the comment author)
      const randomUser = users[Math.floor(Math.random() * users.length)];

      replies.push({
        post: comment.post,
        author: randomUser._id,
        content:
          replyTemplates[Math.floor(Math.random() * replyTemplates.length)],
        parentComment: comment._id,
      });
    }

    const createdReplies = await Comment.insertMany(replies);
    console.log(`✅ Created ${createdReplies.length} replies`);

    return [...createdComments, ...createdReplies];
  } catch (error) {
    console.error("❌ Error seeding comments:", error.message);
    throw error;
  }
};

export const clearComments = async () => {
  try {
    const result = await Comment.deleteMany({});
    console.log(`🗑️  Deleted ${result.deletedCount} comments`);
  } catch (error) {
    console.error("❌ Error clearing comments:", error.message);
    throw error;
  }
};
