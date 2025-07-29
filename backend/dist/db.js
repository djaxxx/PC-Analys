"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
// Charger les variables d'environnement
dotenv_1.default.config();
require('dotenv').config();
console.log(process.env.MONGO_URI);
const MONGO_URI = process.env.MONGO_URI;
const connectDB = async () => {
    if (!MONGO_URI) {
        console.error('❌ Variable d\'environnement MONGO_URI non définie');
        console.error('💡 Vérifie que le fichier .env existe et contient MONGO_URI');
        process.exit(1);
    }
    try {
        await mongoose_1.default.connect(MONGO_URI);
        console.log('✅ Connecté à MongoDB Atlas');
    }
    catch (error) {
        console.error('❌ Erreur de connexion MongoDB:', error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
exports.default = mongoose_1.default;
