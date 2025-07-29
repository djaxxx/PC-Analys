"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ram = void 0;
const mongoose_1 = require("mongoose");
const ramSchema = new mongoose_1.Schema({
    opendb_id: { type: String, required: true, unique: true },
    metadata: { type: mongoose_1.Schema.Types.Mixed, required: true },
    memory: {
        size: Number,
        type: String,
        speed: Number
    },
    specifications: {
        voltage: Number,
        latency: String
    }
}, {
    timestamps: true
});
// Index pour améliorer les performances de recherche
ramSchema.index({ 'metadata.name': 'text' });
ramSchema.index({ 'memory.type': 1 });
ramSchema.index({ 'memory.speed': 1 });
exports.Ram = (0, mongoose_1.model)('Ram', ramSchema);
