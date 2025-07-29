"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Storage = void 0;
const mongoose_1 = require("mongoose");
const storageSchema = new mongoose_1.Schema({
    opendb_id: { type: String, required: true, unique: true },
    metadata: { type: mongoose_1.Schema.Types.Mixed, required: true },
    storage: {
        size: Number,
        type: String,
        interface: String
    },
    specifications: {
        readSpeed: Number,
        writeSpeed: Number,
        formFactor: String
    }
}, {
    timestamps: true
});
// Index pour améliorer les performances de recherche
storageSchema.index({ 'metadata.name': 'text' });
storageSchema.index({ 'storage.type': 1 });
storageSchema.index({ 'storage.interface': 1 });
exports.Storage = (0, mongoose_1.model)('Storage', storageSchema);
