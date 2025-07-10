export default controller = {
    register: async (req, res) => {
        try {
            // Traigo errores
            let errors = validationResult(req);

            if (!errors.isEmpty()) {
                //Si hay errores en el back...
                //Para saber los parametros que llegaron..
                let {errorsParams,errorsMapped} = getMappedErrors(errors);
                return res.status(HTTP_STATUS.BAD_REQUEST.code).json({
                    meta: {
                        status: HTTP_STATUS.BAD_REQUEST.code,
                        url: '/api/user',
                        method: "POST"
                    },
                    ok: false,
                    errors: errorsMapped,
                    params: errorsParams,
                    msg: systemMessages.formMsg.validationError.es
                });
            }
            let { first_name, last_name, email, password } = req.body;

            first_name = capitalizeFirstLetterOfEachWord(first_name, true);
            last_name = capitalizeFirstLetterOfEachWord(last_name, true);

            let userDataToDB = {
                id: uuidv4(),
                first_name,
                last_name,
                email,
                password: bcrypt.hashSync(password, 10), //encripta la password ingresada ,
                user_role_id: 2, 
                verified_email: false,
                payment_type_id,
            };
            const userCreated = await insertUserToDB(userDataToDB); 
            let emailResponse = await generateAndInstertEmailCode(userDataToDB);
            if(!emailResponse) return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR.code).json({});
            // Lo tengo que loggear directamente
            const cookieTime = 1000 * 60 * 60 * 24 * 7; //1 Semana

            // Generar el token de autenticación
            const token = jwt.sign({ id: userCreated.id }, webTokenSecret, {
                expiresIn: "1w",
            }); // genera el token
            res.cookie("userAccessToken", token, {
                maxAge: cookieTime,
                httpOnly: true,
                secure: process.env.NODE_ENV == "production",
                sameSite: "strict",
            });
            // Le  mando ok con el redirect al email verification view
            return res.status(HTTP_STATUS.CREATED.code).json({
                meta: {
                status: HTTP_STATUS.CREATED.code,
                url: "/api/user",
                method: "POST",
                },
                ok: true,
                msg: systemMessages.userMsg.createSuccesfull,
                redirect: "/",
            });
            } catch (error) {
            console.log(`Falle en apiUserController.createUser`);
            console.log(error);
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR.code).json({ error });
            }
    }
}