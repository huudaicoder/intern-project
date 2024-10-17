import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    gender: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    birthday: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    useState: {
      type: Boolean,
      default: true,
    },
    serviceId: {
      type: String,
    },
    facility: {
      type: [String],
    },
    historyTransaction: {
      type: [String],
    },
  },
  { timestamps: true }
);

export default mongoose.model('User', UserSchema);
