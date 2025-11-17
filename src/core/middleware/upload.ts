// Feito por Sophia :)

import multer from 'multer';
import path from 'path';

// Define o caminho para onde os arquivos de upload serão armazenados temporariamente.
// Ele resolve para o diretório 'tmp/uploads' na raiz do projeto.
const uploadPath = path.resolve(__dirname, '..', '..', '..', 'tmp', 'uploads');

/**
 * Configuração de armazenamento em disco para o Multer.
 * Define o diretório de destino e o nome do arquivo.
 */
const storage = multer.diskStorage({
  /**
   * Define o diretório de destino para o arquivo.
   * @param req Objeto de requisição.
   * @param file Objeto de arquivo.
   * @param cb Callback para indicar o diretório.
   */
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  /**
   * Define o nome do arquivo no disco.
   * Adiciona um sufixo único para evitar colisões de nomes.
   * @param req Objeto de requisição.
   * @param file Objeto de arquivo.
   * @param cb Callback para indicar o nome do arquivo.
   */
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

/**
 * Filtro de arquivo para aceitar apenas arquivos CSV.
 * @param req Objeto de requisição.
 * @param file Objeto de arquivo.
 * @param cb Callback para indicar se o arquivo é aceito ou não.
 */
const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel') {
    cb(null, true);
  } else {
    cb(new Error('Formato de arquivo inválido. Envie apenas .csv'), false);
  }
};

/**
 * Instância do Multer configurada para upload de arquivos CSV.
 * Utiliza o armazenamento em disco e o filtro de arquivo definido.
 */
export const uploadCsv = multer({ storage: storage, fileFilter: fileFilter });
