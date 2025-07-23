export default (sequelize, dataTypes) => {

    let alias = "Category";

    let cols = {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        name: { type: dataTypes.STRING(255)},
    }

    let config = {
        tableName: 'categories',
        paranoid: false,
        timestamps: false,
    }

    const Category = sequelize.define(alias, cols, config);

    Category.associate = (models) => {
        const {Model} = models;
        Category.belongsToMany(Model, {
            through: 'model_category',
            foreignKey: 'category_id',
            otherKey: 'model_id',
            as: 'models',
            timestamps: false
        });
    };

    return Category;
}