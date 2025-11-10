function showRequirements() {
        const reqBox = document.getElementById('password-requirements');
        reqBox.classList.add('show');
    }

    function validatePassword() {
        const password = document.getElementById('cadastro-password').value;

        // Validar tamanho
        const lengthReq = document.getElementById('req-length');
        if (password.length >= 8) {
            lengthReq.classList.add('valid');
        } else {
            lengthReq.classList.remove('valid');
        }

        // Validar letra maiúscula
        const upperReq = document.getElementById('req-lowercase');
        if (/[A-Z]/.test(password)) {
            upperReq.classList.add('valid');
        } else {
            upperReq.classList.remove('valid');
        }

        // Validar número
        const numberReq = document.getElementById('req-number');
        if (/\d/.test(password)) {
            numberReq.classList.add('valid');
        } else {
            numberReq.classList.remove('valid');
        }

        // Validar caractere especial
        const specialReq = document.getElementById('req-special');
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            specialReq.classList.add('valid');
        } else {
            specialReq.classList.remove('valid');
        }
    }