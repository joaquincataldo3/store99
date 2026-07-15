import db from "../database/models/index.js";
const { Category, ModelCategory } = db;

export const findAllInDb = async   () => {
    return await Category.findAll();
}

export const insertCategoriesWithModelId = async (categories, modelId, options = {}) => {
    try {
        for(let i = 0; i < categories.length; i++){
            const categoryId = categories[i];
            await ModelCategory.create({
                model_id: modelId,
                category_id: categoryId
            }, options)
        }
        return true;
    } catch (error) {
        console.log('error inserting categories');
        console.log(error);
        return false;
    }
}