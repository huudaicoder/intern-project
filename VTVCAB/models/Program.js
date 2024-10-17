import mongoose from 'mongoose';

const ProgramSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  timeStart: {
    type: String,
    required: true,
  },
  timeFinish: {
    type: String,
    required: true,
  },
  channelId: {
    type: String,
  },
  source: {
    type: String,
  },
});
export default mongoose.model('Program', ProgramSchema);
