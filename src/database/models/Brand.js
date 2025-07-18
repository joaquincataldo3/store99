export default (sequelize, dataTypes) => {

    let alias = "Brand";

    let cols = {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        name: { type: dataTypes.STRING(40)},
    }

    let config = {
        tableName: 'brands',
        paranoid: false,
        timestamps: false,
    }

    const Brand = sequelize.define(alias, cols, config);

    Brand.associate = (models) => {
        const {Model} = models;
        Brand.hasMany(Model, {
            as: 'models',
            foreignKey: 'brand_id'
        })
    };

    return Brand;
}