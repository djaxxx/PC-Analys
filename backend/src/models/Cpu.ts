import { Schema, model } from 'mongoose';

export interface ICpu {
  opendb_id: string;
  metadata: {
    name: string;
    [key: string]: any;
  };
  socket: string;
  coreFamily?: string;
  cores?: {
    total?: number;
    threads?: number;
  };
  clocks?: {
    performance?: {
      base?: number;
      boost?: number;
    };
  };
  specifications?: {
    tdp?: number;
    lithography?: string;
  };
  [key: string]: any;
}

const cpuSchema = new Schema<ICpu>({
  opendb_id: { type: String, required: true, unique: true },
  metadata: { type: Schema.Types.Mixed, required: true },
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

export const Cpu = model<ICpu>('Cpu', cpuSchema); 