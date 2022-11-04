const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  text: {
    type: String,
    required: false
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  vehicle: {
    type: mongoose.Schema.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
});

// Prevent user from submitting more than one review per bootcamp
//ReviewSchema.index({ vehicle: 1, user: 1 }, { unique: true });

// Static method to get avg rating and save
ReviewSchema.statics.getAverageRating = async function(vehicleId) {
  const obj = await this.aggregate([
    {
      $match: { vehicle: vehicleId }
    },
    {
      $group: {
        _id: '$vehicle',
        averageRating: { $avg: '$rating' }
      }
    }
  ]);

  try {
    await this.model('Vehicle').findByIdAndUpdate(vehicleId, {
      averageRating: obj[0].averageRating
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageCost after save
ReviewSchema.post('save', function() {
  this.constructor.getAverageRating(this.vehicle);
});

// Call getAverageCost before remove
ReviewSchema.pre('remove', function() {
  this.constructor.getAverageRating(this.vehicle);
});

module.exports = mongoose.model('Review', ReviewSchema);
