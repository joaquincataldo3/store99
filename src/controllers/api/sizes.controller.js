import { findAllInDb } from "../../helpers/size.js";

const controller = {
    getAll: async (req, res) => {
        try {
            const sizes = await findAllInDb();

            return res.status(200).json({
                msg: 'successfully retrieved sizes',
                ok: true,
                data: sizes
            })
        } catch (error) {
            console.log('error obtaining sizes');
            console.log(error);
            return res.status(500).json({
                msg: 'internal server error',
                ok: false
            })
        }
        

    },
    
}

export default controller;