import { findModelById } from "../../helpers/model.js";
import { getFilesFromDbByShoeId } from "../../helpers/file.js";
import { getS3PublicUrl } from "../../helpers/aws.js";


const controller = {
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
                    const regularUrl = await getS3PublicUrl(file.filename || file.regular_filename);
                    return {
                        key: regularUrl,
                        main_file: file.main_file
                    };
                })
            );

            return res.render('model-detail', {
            model: {
                ...dbModel.dataValues, 
                files: filesWithUrls
            }
            });
        } catch (error) {
            console.log('Error al obtener el detalle del modelo:', error);
            return res.status(500).send('Error interno del servidor');
        }
    },
    editStock: (req, res) => {
        return res.render('edit-stock')
    },
}

export default controller;