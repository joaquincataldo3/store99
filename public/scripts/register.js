window.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('register-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        handleSubmit(form);
    });
});

const handleSubmit = async (form) => {
    const inputs = form.querySelectorAll('.form-input');
    const errorMsg = form.querySelector('.error-msg');
    const submitBtn = form.querySelector('button[type="submit"]');

    let isValid = true;
    let fetchData = {};

    inputs.forEach(inp => {
        inp.classList.remove('input-error');
        if (!inp.value) {
            inp.classList.add('input-error');
            isValid = false;
        } else {
            fetchData[inp.name] = inp.value;
        }
    });

    if (!isValid) return;

    setLoading(submitBtn, true);
    errorMsg.textContent = '';

    try {
        const response = await fetch('/api/user/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fetchData)
        });

        const { ok, msg } = await response.json();

        if (!ok) {
            errorMsg.textContent = msg || 'Error al registrarse';
            return;
        }

        window.location.href = '/inicio-sesion';
    } catch {
        errorMsg.textContent = 'Error de conexión';
    } finally {
        setLoading(submitBtn, false);
    }
};

const setLoading = (btn, loading) => {
    btn.disabled = loading;
    btn.classList.toggle('loading', loading);
};
