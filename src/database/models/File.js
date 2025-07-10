export default (sequelize, dataTypes) => {

    let alias = "File";

    let cols = {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        filename: { type: dataTypes.STRING(255)},
        model_id: { type: dataTypes.INTEGER },
        main_file: { type: dataTypes.INTEGER }
    }

    let config = {
        tableName: 'files',
        paranoid: false,
        timestamps: false,
    }

    const File = sequelize.define(alias, cols, config);

    File.associate = (models) => {
        const {Model} = models;
        File.belongsTo(Model, {
            as: 'model',
            foreignKey: 'model_id'
        })
    };

    return File;
}