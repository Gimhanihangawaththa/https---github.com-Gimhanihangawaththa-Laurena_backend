const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({

    name: { type: String, 
                required: true,
                 unique: true,
                  trim: true,
                   minlength: 3 },

    password: { type: String, required: true, minlength: 6 },

    email_address: { type: String, required: true, unique: true, trim: true } 

    })
    

    const User = mongoose.model('User', userSchema);
    module.exports = User;