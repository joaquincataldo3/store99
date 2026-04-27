import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PDF_PATH = path.resolve(__dirname, "../../../public/files/forma-comprar.pdf");

const controller = {
    replaceFormaComprar: (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ ok: false, msg: 'No se recibió ningún archivo' });
            }
            fs.writeFileSync(PDF_PATH, req.file.buffer);
            return res.status(200).json({ ok: true, msg: 'PDF actualizado correctamente' });
        } catch (error) {
            console.log('Error al reemplazar el PDF:', error);
            return res.status(500).json({ ok: false, msg: 'Error interno del servidor' });
        }
    },
};

export default controller;
