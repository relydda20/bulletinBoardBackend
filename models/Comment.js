import { Schema, model } from 'mongoose';

const commentSchema = new Schema({
  post: { 
    type: Schema.Types.ObjectId, 
    ref: 'Post', 
    required: [true, 'Post reference is required'] // ✅ TAMBAHKAN INI
  },
  author: { 
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required'],
  },
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    minLength: [3, 'Comment must be at least 3 characters long'],
    maxLength: [500, 'Comment cannot exceed 500 characters']
  },
  parentComment: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  }
}, {
  timestamps: true
});

// ...existing indexes...
commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ author: 1 });
commentSchema.index({ parentComment: 1 });

const Comment = model('Comment', commentSchema);

export default Comment;