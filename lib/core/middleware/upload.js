"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadCsv = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uploadPath = path_1.default.resolve(__dirname, '..', '..', '..', 'tmp', 'uploads');
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
});
// Filtro para aceitar apenas arquivos CSV
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel') {
        cb(null, true);
    }
    else {
        cb(new Error('Formato de arquivo inválido. Envie apenas .csv'), false);
    }
};
exports.uploadCsv = (0, multer_1.default)({ storage: storage, fileFilter: fileFilter });
//# sourceMappingURL=upload.js.map