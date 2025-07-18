window.addEventListener('DOMContentLoaded', () => {
    checkForRegisterSubmit();
})

const checkForRegisterSubmit = () => {
    const form = document.getElementById('sign-in-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        validateFormDataAndFetch(form);
    })
}

const validateFormDataAndFetch = async (form) => {
    const inputs = form.querySelectorAll('.form-input');
    let isValidForm = true;
    let fetchData = {}
    inputs.forEach(inp => {
        inp.classList.remove('input-error')
        if(!inp.value) {
            inp.classList.add('input-error')
            isValidForm = false;
        } else {
            fetchData[inp.name] = inp.value
        }
    })
    if(!isValidForm) return;
    const response = await fetch('/api/user/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fetchData)
    })
    const jsonResponse = await response.json();
    const {ok, msg} = jsonResponse;
    if(!ok){
        const errorMsgElement = document.querySelector('.error-msg');
        errorMsgElement.innerText = msg;
        return;
    }
}