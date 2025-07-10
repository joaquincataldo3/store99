export default (sequelize, dataTypes) => {
    let alias = "Stock";

    let cols = {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        model_id: { type: dataTypes.INTEGER },
        size_id: { type: dataTypes.INTEGER },
    };

    let config = {
        tableName: 'stock',
        paranoid: false,
        timestamps: false
    };

    const Stock = sequelize.define(alias, cols, config);

    return Stock;
};