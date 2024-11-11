const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EventSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  conference: {
    type: Schema.Types.ObjectId,
    ref: "Conference",
    required: true,
  },
  time: {
    type: Date,
    required: true,
  },
  eventId: {
    type: String,
    required: true,
  },
  speakers: {
    type: Map,
    of: new Schema({
      attended: {
        type: Boolean,
        default: false,
      },
    }),
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
  description: {
    type: String,
  },
});

module.exports = mongoose.model("Event", EventSchema);
