import { Schema, model } from 'mongoose';

export interface IStorage {
  opendb_id: string;
  metadata: {
    name: string;
    [key: string]: any;
  };
  storage?: {
    size?: number;
    type?: string;
    interface?: string;
  };
  specifications?: {
    readSpeed?: number;
    writeSpeed?: number;
    formFactor?: string;
  };
  [key: string]: any;
}

const storageSchema = new Schema<IStorage>({
  opendb_id: { type: String, required: true, unique: true },
  metadata: { type: Schema.Types.Mixed, required: true },
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

export const Storage = model<IStorage>('Storage', storageSchema); 