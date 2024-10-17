import mongoose from 'mongoose';

const ChannelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  photos: {
    type: [String],
  },
  accessRight: {
    type: Boolean,
    default: false,
  },
  groups: {
    type: [String],
  },
  programs: {
    type: [String],
  },
  source: {
    type: String,
  },
});

export default mongoose.model('Channel', ChannelSchema);
