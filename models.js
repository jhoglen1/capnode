'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const brewPostSchema = mongoose.Schema({
  reviewer: {type: String},
  brew: {type: String, required: true},
  content: {type: String},
  
});



brewPostSchema.methods.serialize = function() {
  return {
    id: this._id,
    reviewer: this.reviewer,
    content: this.content,
    brew: this.brew
    
  };
};

const BrewPost = mongoose.model('BrewPost', brewPostSchema);

module.exports = {BrewPost};