import db from "../database/models/index.js";
const { Model } = db;

export const findAllModels = async () => {
    return await Model.findAll({
        include: ['brand']
    });
}

export const findModelByNameAndColor = async (name, color) => {
    try {
        if(!name || !color) return undefined;

        const model = await Model.findOne({
            where: {
                name, 
                color
            }
        })

        return model;
    } catch (error) {
        console.log('error finding model by name and color');
        console.log(error);
        return undefined;
    }
    
}

export const findModelById = async (shoeId) => {
    try {
        if (!shoeId || isNaN(Number(shoeId))) return undefined;
        const shoe = await Model.findByPk(shoeId, {
            include: ['brand']
        });
        return shoe;
    } catch (error) {
        console.log('error finding model by id');
        console.log(error);
        return undefined;
    }
}


export const insertModelInDb = async (modelToInsert) => {
    try {
        const {name, color, brandId, categoryId} = modelToInsert;
        
        const newModel = await Model.create({
            name,
            color,
            brand_id: brandId,
            category_id: categoryId
        })
        return newModel;
    } catch (error) {
        console.log('error inserting model in db');
        console.log(error);
        return undefined;
    }
} 

export const deleteModelById = async (shoeId) => {
    try {
        await Model.destroy({
            where: {
                id: shoeId
            }
        })
    } catch (error) {
        console.log('error deleting model by id');
        console.log(error);
        return false;
    }
}