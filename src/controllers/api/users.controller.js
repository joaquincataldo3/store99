import { getMappedErrors } from "../../helpers/errors.js";
import { findByEmail, insertInDb } from "../../helpers/user.js";
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

const controller = {
    register: async (req, res) => {
        try {
            let errors = validationResult(req);

            if (!errors.isEmpty()) {
                let {errorsParams,errorsMapped} = getMappedErrors(errors);
                return res.status(400).json({
                    ok: false,
                    errors: errorsMapped,
                    params: errorsParams,
                });
            }
            const { username, email, password } = req.body;
            const sanitizedEmail = email.toLowerCase();

            const userExists = await findByEmail(email);

            if(userExists === undefined){
                return res.status(500).json({
                    ok: false,
                    msg: 'internal server error'
                })
            }

            if(userExists){
                return res.status(409).json({
                    ok: false,
                    msg: 'user already exists'
                })
            }

            const sanitizedUsername = username.toLowerCase();

            const userDataToDB = {
                id: uuidv4(),
                username: sanitizedUsername,
                email: sanitizedEmail,
                password: bcrypt.hashSync(password, 10),
            };
            
            const newUser = await insertInDb(userDataToDB);

            if(!newUser) {
                return res.status(500).json({
                    ok: false,
                    msg: 'internal server error',
                });
            }

            return res.status(200).json({
                ok: true,
                msg: 'successfully created user',
            });
            } catch (error) {
                console.log(`error in register`);
                console.log(error);
                return res.status(500).json({ 
                    ok: false,
                    msg: error.message 
                });
            }
    },
    signIn: async (req, res) => {
        try {
            const {email, password} = req.body;

            if(!email || !password){
                return res.status(400).json({
                    ok: false,
                    msg: 'email or password not provided'
                })
            }

            const userExists = await findByEmail(email);

            if(userExists === undefined){
                return res.status(500).json({
                    ok: false,
                    msg: 'internal server error'
                })
            }

            if(!userExists){
                return res.status(404).json({
                    ok: false,
                    msg: 'invalid credentials'
                })
            }

            const user = userExists;

            const isValidPassword = bcrypt.compareSync(password, user.password);
            console.log(isValidPassword)
            console.log(user.password)

            if(!isValidPassword) {
                return res.status(400).json({
                    ok: false,
                    msg: 'invalid credentials'
                })
            }

            let cookieTime = 1000 * 60 * 60 * 24 * 7; 
            
            const webTokenSecret = process.env.JSONWEBTOKEN_SECRET;

            req.session.userLoggedId = user.id;
            const token = jwt.sign({ id: user.id }, webTokenSecret, {
                expiresIn: "7d",
            }); 
            res.cookie("userAccessToken", token, {
                maxAge: cookieTime,
                httpOnly: true,
                secure: process.env.NODE_ENV == "production",
                sameSite: "strict",
            });

            return res.status(200).json({
                ok: true,
                msg: 'successfully signed in'
            })

        } catch (error) {
            console.log(`error in sign in`);
            console.log(error);
            return res.status(500).json({ 
                ok: false,
                msg: error.message 
            });
        }
        
    }
}

export default controller;