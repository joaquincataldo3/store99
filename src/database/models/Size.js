export default (sequelize, dataTypes) => {

    let alias = "Size";

    let cols = {
        id: {
            type: dataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        arg_size: {
            type: dataTypes.DECIMAL(5,1),
            allowNull: false
        },
        usa_size: {
            type: dataTypes.DECIMAL(5,1),
            allowNull: false
        },
        cm: {
            type: dataTypes.DECIMAL(5,1),
            allowNull: false
        }
    }

    let config = {
        tableName: 'sizes',
        paranoid: false,
        timestamps: false,
    }

    const Size = sequelize.define(alias, cols, config);

    Size.associate = (models) => {
        const {Model, Stock} = models;
        Size.belongsToMany(Model, {
            through: Stock,
            foreignKey: 'size_id',
            otherKey: 'model_id',
            as: 'models'
        });
    };

    return Size;
}