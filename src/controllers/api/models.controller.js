import { deleteFilesFromDbByShoeId, filterFiles, getFilesFromDbByShoeId, handleModelFiles, insertFilesInDb } from "../../helpers/file";
import { deleteModelById, findModelById, findModelByNameAndColor, insertModelInDb } from "../../helpers/model";
import { findBrandById } from "../../helpers/brand";
import { deleteFilesFromS3 } from "../../helpers/aws";

export default controller = {
    create: async (req, res) => {
        try {
            let {name, color, brandId} = req.body;

            name = name.toLowerCase();
            color = color.toLowerCase();

            const files = req.files;
            const areInvalidFiles = filterFiles(files);
            if(!areInvalidFiles){
                return res.status(400).json({
                    msg: 'invalid extension files',
                    ok: false
                })
            }

            const modelExists = await findModelByNameAndColor(name, color);
            if(modelExists === undefined){
                return res.status(500).json({
                    msg: 'internal server error',
                    ok: false
                })
            }
            if(modelExists){
                return res.status(409).json({
                    msg: 'shoe already exists',
                    ok: false
                })
            }
            const brandExists = findBrandById(brandId);
            if(!brandExists) { 
                return res.status(400).json({
                    msg: "brand doesn't exist",
                    ok: false
                })
            }
            const newModelToCreate = {
                name,
                color,
                brandId
            }
            const modelInserted = await insertModelInDb(newModelToCreate);
            if(!modelInserted){
                return res.status(500).json({
                    msg: 'internal server error',
                    ok: false
                })
            }
            
            const fileKeys = await handleModelFiles(files);
            if(fileKeys === undefined){
                return res.status(500).json({
                    msg: 'internal server error',
                    ok: false
                })
            }
            const areFilesInsertedInDb = await insertFilesInDb(fileKeys)
            if(!areFilesInsertedInDb){
                return res.status(500).json({
                    msg: 'internal server error',
                    ok: false
                })
            }
            return res.status(201).json({
                ok: true,
                msg: 'shoe created successfully'
            })
        } catch (error) {
            console.log('error creating model');
            console.log(error);
            return res.status(500).json({
                ok: false,
                msg: 'internal server error'
            })
        }
        
    },
    delete: async (req, res) => {
        try {
            const {shoeId} = req.params;
            if(!shoeId || Number(shoeId)){
                return res.json({
                    msg: 'invalid shoe id',
                    ok: false,
                })
            }
            const shoeExists = await findModelById(shoeId);
            if(shoeExists === undefined){
                return res.status(500).json({
                    ok: false,
                    msg: 'internal server error'
                })
            }
            if(shoeExists === null){
                return res.status(404).json({
                    ok: false,
                    msg: 'shoe does not exist'
                })
            }
            const files = await getFilesFromDbByShoeId(shoeId);
            if(!files){
                return res.status(500).json({
                    msg: 'internal server error',
                    ok: false
                })
            }
            const areFilesSuccessfullyDeletedFromAws = await deleteFilesFromS3(files);
            if(!areFilesSuccessfullyDeletedFromAws){
                return res.status(500).json({
                    msg: 'internal server error',
                    ok: false
                })
            }
            const areFilesSuccessfullyDeletedFromDb = await deleteFilesFromDbByShoeId(shoeId);
            if(!areFilesSuccessfullyDeletedFromDb){
                return res.status(500).json({
                    msg: 'internal server error',
                    ok: false
                })
            }
            await deleteModelById(shoeId)
            return res.status(200).json({
                ok: true,
                msg: 'shoe successfully deleted'
            })
        } catch (error) {
            console.log('error deleting shoe');
            console.log(error);
            return res.status(500).json({
                ok: false,
                msg: 'internal server error'
            })
        }
        
    }
}