import { findAllInDb } from "../../helpers/category.js";

const controller = {
    getAll: async (req, res) => {
        try {
            const categories = await findAllInDb();
            return res.status(200).json({
                msg: 'successfully retrieved categories',
                ok: true,
                data: categories
            })
        } catch (error) {
            console.log('error obtaining categories');
            console.log(error);
            return res.status(500).json({
                msg: 'internal server error',
                ok: false
            })
        }
        

    }
}

export default controller;