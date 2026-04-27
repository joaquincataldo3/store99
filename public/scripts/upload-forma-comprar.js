const form = document.getElementById('upload-form');
const fileInput = document.getElementById('pdf');
const submitBtn = document.getElementById('submit-btn');
const msgEl = document.getElementById('msg');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const file = fileInput.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
        msgEl.textContent = 'Solo se permiten archivos PDF.';
        msgEl.className = 'msg error';
        return;
    }

    const formData = new FormData();
    formData.append('pdf', file);

    submitBtn.disabled = true;
    submitBtn.textContent = 'Subiendo...';
    msgEl.textContent = '';
    msgEl.className = 'msg';

    try {
        const res = await fetch('/api/file/forma-comprar', {
            method: 'POST',
            body: formData,
        });
        const data = await res.json();
        msgEl.textContent = data.msg;
        msgEl.className = res.ok ? 'msg success' : 'msg error';
        if (res.ok) form.reset();
    } catch (err) {
        msgEl.textContent = 'Error al conectar con el servidor.';
        msgEl.className = 'msg error';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Subir PDF';
    }
});
