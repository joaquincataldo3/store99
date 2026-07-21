import db from "../database/models/index.js";
const { Stock, Sequelize } = db;

export const findStockByModel = async (modelId) => {
    return await Stock.findAll({
        where: {
            model_id: modelId
        },
        include: [
        {
            association: 'size' 
        },
        {
            association: 'model',
            include: [
            { association: 'files' },
            { association: 'categories' },
            { association: 'brand' }
            ]
        }
        ]
    });
}

export const findAll = async () => {
    return await Stock.findAll({
        include: [
        {
            association: 'size'
        },
        {
            association: 'model',
            include: [
            { association: 'files' },
            { association: 'categories' },
            { association: 'brand' }
            ]
        }
        ],
        order: [[Sequelize.col('size.us_size'), 'DESC']]
    });
}

export const syncStockSizes = async (modelId, newSizeIds, options = {}) => {
    const currentStock = await Stock.findAll({
        where: { model_id: modelId },
        raw: true,
        transaction: options.transaction,
    });

    const currentSizeIds = currentStock.map(s => s.size_id);

    const toInsert = newSizeIds.filter(id => !currentSizeIds.includes(id));
    const toDelete = currentSizeIds.filter(id => !newSizeIds.includes(id));

    const insertPromises = toInsert.map(sizeId =>
        Stock.create({ model_id: modelId, size_id: sizeId }, options)
    );

    const deletePromise = Stock.destroy({
        where: {
            model_id: modelId,
            size_id: toDelete
        },
        transaction: options.transaction,
    });

    await Promise.all([...insertPromises, deletePromise]);

    return { inserted: toInsert, deleted: toDelete };
};