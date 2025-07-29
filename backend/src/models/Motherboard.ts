import { Schema, model } from 'mongoose';

export interface IMotherboard {
  opendb_id: string;
  metadata: {
    name: string;
    [key: string]: any;
  };
  socket?: string;
  chipset?: string;
  formFactor?: string;
  specifications?: {
    memorySlots?: number;
    maxMemory?: number;
    pciSlots?: number;
  };
  [key: string]: any;
}

const motherboardSchema = new Schema<IMotherboard>({
  opendb_id: { type: String, required: true, unique: true },
  metadata: { type: Schema.Types.Mixed, required: true },
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

export const Motherboard = model<IMotherboard>('Motherboard', motherboardSchema); 