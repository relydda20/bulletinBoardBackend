import { Schema, model } from 'mongoose';

const postSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: {
    type: String,
    required: true,
    minlength: [5, 'Title must be at least 5 characters long']
  },
  content: {
    type: String,
    required: true,
    minlength: [20, 'Content must be at least 20 characters long']
  },
  timestamp: { type: Date, default: Date.now }
});

const Post = model('Post', postSchema);

export default Post;
