"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cpu = void 0;
const mongoose_1 = require("mongoose");
const cpuSchema = new mongoose_1.Schema({
    opendb_id: { type: String, required: true, unique: true },
    metadata: { type: mongoose_1.Schema.Types.Mixed, required: true },
    socket: { type: String, required: true },
    coreFamily: String,
    cores: {
        total: Number,
        threads: Number
    },
    clocks: {
        performance: {
            base: Number,
            boost: Number
        }
    },
    specifications: {
        tdp: Number,
        lithography: String
    }
}, {
    timestamps: true
});
// Index pour améliorer les performances de recherche
cpuSchema.index({ 'metadata.name': 'text' });
cpuSchema.index({ socket: 1 });
cpuSchema.index({ coreFamily: 1 });
exports.Cpu = (0, mongoose_1.model)('Cpu', cpuSchema);
