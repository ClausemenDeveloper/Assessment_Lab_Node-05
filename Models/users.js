const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = new Schema({
    userId: {
        type: Number,
        unique: true,
        required: true
    },
    name: { 
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Users", userSchema);
