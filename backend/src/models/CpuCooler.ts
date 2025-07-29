import { Schema, model } from 'mongoose';

export interface ICpuCooler {
  opendb_id: string;
  metadata: {
    name: string;
    [key: string]: any;
  };
  type?: string;
  socket?: string[];
  specifications?: {
    noiseLevel?: number;
    fanSize?: number;
    height?: number;
  };
  [key: string]: any;
}

const cpuCoolerSchema = new Schema<ICpuCooler>({
  opendb_id: { type: String, required: true, unique: true },
  metadata: { type: Schema.Types.Mixed, required: true },
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

export const CpuCooler = model<ICpuCooler>('CpuCooler', cpuCoolerSchema); 