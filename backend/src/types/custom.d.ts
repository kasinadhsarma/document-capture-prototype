/// <reference types="express-serve-static-core" />
/// <reference types="multer" />

declare global {
  namespace Express {
    interface Request {
      file?: Multer.File;
      files?: {
        [fieldname: string]: Multer.File[];
      } | Multer.File[];
    }
  }
}

export {};
