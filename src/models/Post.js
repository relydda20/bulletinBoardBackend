import {Schema, model} from "mongoose";
import generateShortId from "./types/shortid.js";

const postSchema = new Schema(
  {
    shortId: {
      type: String,
      default: generateShortId,
      unique: true,
      index: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minLength: [5, "Title must be at least 5 characters long"],
      maxLength: [100, "Title cannot exceed 100 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
      minLength: [20, "Content must be at least 20 characters long"],
    },
    // tags: [{
    //   type: String,
    //   trim: true
    // }],
  },
  {
    timestamps: true,
  }
);

// Indexes
// postSchema.index({ shortId: 1 });
// postSchema.index({ author: 1 });
// postSchema.index({ createdAt: -1 });
// postSchema.index({ title: 'text', content: 'text' }); // For search

const Post = model("Post", postSchema);

export default Post;
