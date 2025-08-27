const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  organization: {
    type: mongoose.Schema.ObjectId,
    ref: 'Organization',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Please add an event date']
  },
  startTime: {
    type: String,
    required: [true, 'Please add a start time']
  },
  endTime: {
    type: String,
    required: [true, 'Please add an end time']
  },
  location: {
    type: String,
    required: [true, 'Please add a location']
  },
  address: {
    type: String,
    required: [true, 'Please add an address']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: [
      'Environment',
      'Education',
      'Health',
      'Animals',
      'Community',
      'Arts',
      'Elderly',
      'Children',
      'Disability',
      'Homelessness'
    ]
  },
  skillsRequired: {
    type: [String],
    required: [true, 'Please add required skills']
  },
  volunteersNeeded: {
    type: Number,
    required: [true, 'Please add number of volunteers needed'],
    min: [1, 'At least 1 volunteer is required']
  },
 // Update the volunteersRegistered field in Event.js model
volunteersRegistered: [
  {
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Volunteer'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'waitlisted'],
      default: 'pending'
    },
    message: {
      type: String,
      required: [true, 'Please add a registration message']
    },
    skills: {
      type: [String],
      required: [true, 'Please add relevant skills']
    },
    registeredAt: {
      type: Date,
      default: Date.now
    }
  }
],
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  image: {
    type: String,
    default: 'https://via.placeholder.com/150'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Update event status based on date
eventSchema.pre('save', function(next) {
  const now = new Date();
  const eventDate = new Date(this.date);
  
  if (eventDate < now && this.status === 'upcoming') {
    this.status = 'active';
  }
  
  next();
});

module.exports = mongoose.model('Event', eventSchema);