import { Schema, model } from 'mongoose';

export interface IRam {
  opendb_id: string;
  metadata: {
    name: string;
    [key: string]: any;
  };
  memory?: {
    size?: number;
    type?: string;
    speed?: number;
  };
  specifications?: {
    voltage?: number;
    latency?: string;
  };
  [key: string]: any;
}

const ramSchema = new Schema<IRam>({
  opendb_id: { type: String, required: true, unique: true },
  metadata: { type: Schema.Types.Mixed, required: true },
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

export const Ram = model<IRam>('Ram', ramSchema); 