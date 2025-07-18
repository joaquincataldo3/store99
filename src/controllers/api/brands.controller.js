import { getAllBrands } from "../../helpers/brand.js"

 const controller = {
    getAll: async (req, res) => {
        try {
            const brands = await getAllBrands();
            return res.status(200).json({
                ok: true,
                msg: 'succesfully retrieved all brands',
                data: brands
            })
        } catch (error) {
            console.log('error getting all brands')
            console.log(error)
            return res.status(500).json({
                ok: true,
                msg: 'error retrieving brands',
                data: null
            })
        }
        
    }
}

export default controller;