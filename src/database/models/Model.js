export default (sequelize, dataTypes) => {

    let alias = "Model";

    let cols = {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        brand_id: { type: dataTypes.INTEGER},
        name: { type: dataTypes.STRING(255)},
        color: { type: dataTypes.STRING(255)}
    }

    let config = {
        tableName: 'models',
        paranoid: false,
        timestamps: false,
    }

    const Model = sequelize.define(alias, cols, config);

    Model.associate = (models) => {
        const {Brand, File, Stock, Size, Category} = models;
        Model.belongsTo(Brand, {
            as: 'brand',
            foreignKey: 'brand_id'
        })
        Model.belongsToMany(Category, {
            through: 'model_category',
            foreignKey: 'model_id',
            otherKey: 'category_id',
            as: 'categories'
        });

        Model.hasMany(File, {
            as: 'files',
            foreignKey: 'model_id'
        })
        Model.belongsToMany(Size, {
            through: Stock,
            foreignKey: 'model_id',
            otherKey: 'size_id',
            as: 'stocks',
            timestamps: false
        });
    };

    return Model;
}