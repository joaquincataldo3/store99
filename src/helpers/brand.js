import db from "../../database/models/index.js";
const { Brand } = db;

export const findBrandById = async (id) => {
    try {
        const brand = await Brand.findByPk(id);
        return brand;
    } catch (error) {
        console.log('error finding brand by id');
        console.log(error);
        return null;
    }
}