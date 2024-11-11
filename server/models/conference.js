const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const ConferenceSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
    default: "IIT Mandi",
  },
  events: {
    type: [Schema.Types.ObjectId],  // References to event objects
    ref: 'Event',
    default: [],
  },
  attendees: {
    type: Map,
    of: new Schema({
      attended: {
        type: Boolean,
        default: false,
      },
    }),
  },
});

module.exports = mongoose.model('Conference', ConferenceSchema);
