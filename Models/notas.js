const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const notaSchema = new Schema({
    codigo: {
        type: Number,
        unique: true,
        required: true
    },
    disciplina: { 
        type: String,
        required: true
    },
    professor: {
        type: String,
        required: true
    },
    nota: {
        type: Number,
        min: 0,
        max: 20,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Notas", notaSchema);