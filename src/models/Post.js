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
      maxLength: [100, "Title cannot exceed 100 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
    },
    // tags: [{
    //   type: String,
    //   trim: true
    // }],
  },
  {
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true},
  }
);

// Virtual populate: pull comments linked to this post
postSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "post",
  justOne: false,
  options: {sort: {createdAt: -1}},
});

// Indexes
// postSchema.index({ shortId: 1 });
// postSchema.index({ author: 1 });
// postSchema.index({ createdAt: -1 });
// postSchema.index({ title: 'text', content: 'text' }); // For search

const Post = model("Post", postSchema);

export default Post;
