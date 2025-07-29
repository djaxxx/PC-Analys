"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Motherboard = void 0;
const mongoose_1 = require("mongoose");
const motherboardSchema = new mongoose_1.Schema({
    opendb_id: { type: String, required: true, unique: true },
    metadata: { type: mongoose_1.Schema.Types.Mixed, required: true },
    socket: String,
    chipset: String,
    formFactor: String,
    specifications: {
        memorySlots: Number,
        maxMemory: Number,
        pciSlots: Number
    }
}, {
    timestamps: true
});
// Index pour améliorer les performances de recherche
motherboardSchema.index({ 'metadata.name': 'text' });
motherboardSchema.index({ socket: 1 });
motherboardSchema.index({ chipset: 1 });
motherboardSchema.index({ formFactor: 1 });
exports.Motherboard = (0, mongoose_1.model)('Motherboard', motherboardSchema);
