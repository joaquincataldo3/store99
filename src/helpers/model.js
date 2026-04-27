import db from "../database/models/index.js";
const { Model, ModelCategory, Brand, File, Category} = db;

export const findAllModelsByCategory = async (categoryId) => {
  return await ModelCategory.findAll({
    where: { category_id: categoryId },
    include: [
            {
                association: 'model',
                include: [
                { association: 'brand' },
                { association: 'files' }
                ]
            },
            {
                association: 'category'
            }
    ]
  });
};

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
                include: [
            {
                association: 'brand',
            },
            {
                association: 'categories'
            },
            {
                association: 'stocks'
            },
            {
                association: 'files'
            }
    ]
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

export const findLatest = async () => {
    try {
    const shoes = await Model.findAll({
      limit: 3,
      order: [['id', 'DESC']], // usa el autoincremental para simular "últimos"
      include: [
        { association: 'brand' },
        { association: 'categories' },
        { association: 'stocks' },
        { association: 'files' }
      ]
    });
    return shoes;
  } catch (error) {
    console.log('error finding last 3 models');
    console.log(error);
    return [];
  }
}