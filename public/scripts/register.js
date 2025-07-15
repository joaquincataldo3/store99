window.addEventListener('DOMContentLoaded', () => {
  
    checkForRegisterSubmit();
})

const checkForRegisterSubmit = () => {
    const form = document.getElementById('register-form');
    console.log(form)
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const inputs = form.querySelectorAll('.form-input');
        let isValidForm;
        inputs.forEach(inp => {
            console.log(inp.value)
            if(!inp.value) {
                inp.classList.add('input-error')
            }
        })
    })
}