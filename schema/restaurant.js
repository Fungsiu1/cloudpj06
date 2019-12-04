var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var restSchema = new Schema({
//restaurant_id: String,
//author: String,
name: String ,
borough: String,
cuisine: String,
photo: String,
photo_mimetype: String ,
street: String, 
building: String, 
zipcode: String, 
coord_1:Number, 
coord_2:Number,
user: String, 
score: {type:Number, min:0, max:10},
owner: String

});

module.exports = restSchema;
