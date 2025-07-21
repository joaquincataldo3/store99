import db from "../database/models/index.js";
const { Category, ModelCategory } = db;

export const findAllInDb = async   () => {
    return await Category.findAll();
}

export const insertCategoriesWithModelId = async (categories, modelId) => {
    try {
        console.log(categories)
        for(let i = 0; i < categories.length; i++){
            const categoryId = categories[i];
            console.log(`Insertando relación model_id=${modelId}, category_id=${categoryId}`);
            await ModelCategory.create({
                model_id: modelId,
                category_id: categoryId
            })
        }
        return true;
    } catch (error) {
        console.log('error inserting categories');
        console.log(error);
        return false;
    }
}