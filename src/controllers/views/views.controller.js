import { findModelById } from "../../helpers/model.js";
import { getFilesFromDbByShoeId } from "../../helpers/file.js";
import { getCloudinaryUrl } from "../../helpers/cloudinary.js";
import { checkIfLogged } from "../../helpers/auth.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PDF_PATH = path.resolve(__dirname, "../../../public/files/forma-comprar.pdf");


const controller = {
    home: (req, res) => {
        return res.render('home');
    },
    signIn: (req, res) => {
        return res.render('sign-in');
    },
    register: (req, res) => {
        return res.render('register');
    },
    createModel: (req, res) => {
        return res.render('create-model')
    },
    modelsList: (req, res) => {
        return res.render('models-list')
    },
    modelDetail: async (req, res) => {
        try {
            const { shoeId } = req.params;
            const dbModel = await findModelById(shoeId);
            if (!dbModel) {
                return res.status(404).send('Modelo no encontrado');
            }

            const filesFromDb = await getFilesFromDbByShoeId(dbModel.id);

            const filesWithUrls = await Promise.all(
                filesFromDb.map(async file => {
                    const regularUrl = getCloudinaryUrl(file.regular_filename);
                    return {
                        key: regularUrl,
                        main_file: file.main_file
                    };
                })
            );
            const isLogged = checkIfLogged(req, res);
            return res.render('model-detail', {
                model: {
                    ...dbModel.dataValues,
                    files: filesWithUrls
                },
                isLogged,
                whatsappNumber: process.env.WHATSAPP_NUMBER
            });
        } catch (error) {
            console.log('Error al obtener el detalle del modelo:', error);
            return res.status(500).send('Error interno del servidor');
        }
    },
    editStock: (req, res) => {
        return res.render('edit-stock')
    },
    modelsStock: (req, res) => {
        const isLogged = checkIfLogged(req);
        return res.render('model-stocks', {isLogged});
    },
    formaComprar: (req, res) => {
        return res.sendFile(PDF_PATH);
    },
    uploadFormaComprar: (req, res) => {
        return res.render('upload-forma-comprar');
    },
}

export default controller;