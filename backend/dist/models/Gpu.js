"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Gpu = void 0;
const mongoose_1 = require("mongoose");
const gpuSchema = new mongoose_1.Schema({
    opendb_id: { type: String, required: true, unique: true },
    metadata: { type: mongoose_1.Schema.Types.Mixed, required: true },
    manufacturer: String,
    memory: {
        size: Number,
        type: String
    },
    specifications: {
        tdp: Number,
        lithography: String
    }
}, {
    timestamps: true
});
// Index pour améliorer les performances de recherche
gpuSchema.index({ 'metadata.name': 'text' });
gpuSchema.index({ manufacturer: 1 });
gpuSchema.index({ 'memory.type': 1 });
exports.Gpu = (0, mongoose_1.model)('Gpu', gpuSchema);
