import { Schema, model } from 'mongoose';

export interface IGpu {
  opendb_id: string;
  metadata: {
    name: string;
    [key: string]: any;
  };
  manufacturer?: string;
  memory?: {
    size?: number;
    type?: string;
  };
  specifications?: {
    tdp?: number;
    lithography?: string;
  };
  [key: string]: any;
}

const gpuSchema = new Schema<IGpu>({
  opendb_id: { type: String, required: true, unique: true },
  metadata: { type: Schema.Types.Mixed, required: true },
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

export const Gpu = model<IGpu>('Gpu', gpuSchema); 