'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const brewPostSchema = mongoose.Schema({
  User: {type: String},
  Date: {type: String},
  Brew: {type: String},
  Brewery: {type: String},
  Style: {type: String},
  Review: {type: String}
  
});



brewPostSchema.methods.serialize = function() {
  return {
    id: this._id,
    User: this.User,
    Date: this.Date,
    Brew: this.Brew,
    Brewery: this.Brewery,
    Style: this.Style,
    Review: this.Review
    
  };
};

const BrewPost = mongoose.model('BrewPost', brewPostSchema);

module.exports = {BrewPost};