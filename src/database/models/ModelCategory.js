export default (sequelize, dataTypes) => {

    let alias = "ModelCategory";

    let cols = {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        model_id: {
            type: dataTypes.INTEGER,
            allowNull: false,
        },
        category_id: {
            type: dataTypes.INTEGER,
            allowNull: false,
        }
    };

    let config = {
        tableName: 'model_category',
        timestamps: false,
    };

    const ModelCategory = sequelize.define(alias, cols, config);

    ModelCategory.associate = (models) => {
        const { Model, Category } = models;

        ModelCategory.belongsTo(Model, {
            foreignKey: 'model_id',
            as: 'model',
        });

        ModelCategory.belongsTo(Category, {
            foreignKey: 'category_id',
            as: 'category',
        });
    };

    return ModelCategory
}