const controller = {
    signIn: (req, res) => {
        return res.render('sign-in');
    },
    register: (req, res) => {
        return res.render('register');
    }
}

export default controller;