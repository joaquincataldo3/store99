import db from "../database/models/index.js";
const { Size } = db;

export const findAllInDb = async   () => {
    return await Size.findAll();
}