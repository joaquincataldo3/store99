const controller = {
    signIn: (req, res) => {
        return res.render('sign-in');
    },
    register: (req, res) => {
        return res.render('register');
    },
    createModel: (req, res) => {
        return res.render('create-model')
    }
}

export default controller;