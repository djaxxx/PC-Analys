"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CpuCooler = void 0;
const mongoose_1 = require("mongoose");
const cpuCoolerSchema = new mongoose_1.Schema({
    opendb_id: { type: String, required: true, unique: true },
    metadata: { type: mongoose_1.Schema.Types.Mixed, required: true },
    type: String,
    socket: [String],
    specifications: {
        noiseLevel: Number,
        fanSize: Number,
        height: Number
    }
}, {
    timestamps: true
});
// Index pour améliorer les performances de recherche
cpuCoolerSchema.index({ 'metadata.name': 'text' });
cpuCoolerSchema.index({ type: 1 });
cpuCoolerSchema.index({ socket: 1 });
exports.CpuCooler = (0, mongoose_1.model)('CpuCooler', cpuCoolerSchema);
