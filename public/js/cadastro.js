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

    const inputTelefone = document.getElementById('telefone');

inputTelefone.addEventListener('input', (e) => {
    let valor = e.target.value.replace(/\D/g, '');

    valor = valor.substring(0, 11);

    let valorFormatado = '';
    if (valor.length > 0) {
        valorFormatado = '(' + valor.substring(0, 2);
    }
    if (valor.length > 2) {
        valorFormatado = '(' + valor.substring(0, 2) + ') ' + valor.substring(2, 7);
    }
    if (valor.length > 7) {
        valorFormatado = '(' + valor.substring(0, 2) + ') ' + valor.substring(2, 7) + '-' + valor.substring(7, 11);
    }

    // 4. Atualiza o valor no campo
    e.target.value = valorFormatado;
});


document.addEventListener('DOMContentLoaded', () => {
    
    const form = document.getElementById('form-cadastro');
    const mensagemDiv = document.getElementById('mensagem');
     
    form.addEventListener('submit', async (evento) => {
        
        evento.preventDefault();
        
        mensagemDiv.innerText = '';
        mensagemDiv.className = 'mensagem-feedback';

        
        const nome = document.getElementById('nome').value;
        const sobrenome = document.getElementById('sobrenome').value;
        const email = document.getElementById('email').value;
        const telefone = document.getElementById('telefone').value;
        const senha = document.getElementById('senha').value;
        const confirmaSenha = document.getElementById('senhaconf').value;

        
        if (senha !== confirmaSenha) {
            mensagemDiv.innerText = 'As senhas não conferem.';
            mensagemDiv.classList.add('erro'); 
            return; 
        }
        
        const dadosDeCadastro = {
            nome: `${nome} ${sobrenome}`,
            telefone: telefone,
            email: email,
            senha: senha
        };

        try {
            const resposta = await fetch('http://localhost:3333/api/v1/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dadosDeCadastro),
            });

            const resultado = await resposta.json();

            if (!resposta.ok) {
                mensagemDiv.innerText = `Erro: ${resultado.error || 'Não foi possível cadastrar'}`;
                mensagemDiv.classList.add('erro');
            } else {
                // Sucesso!
                mensagemDiv.innerText = 'Cadastro realizado com sucesso! Você será redirecionado...';
                mensagemDiv.classList.add('sucesso'); 
                form.reset(); 
                
                setTimeout(() => {
                    window.location.href = 'inicio.html'; 
                }, 2000);
            }

        } catch (erro) {
            console.error('Erro de rede:', erro);
            mensagemDiv.innerText = 'Erro ao conectar com o servidor. Tente novamente.';
            mensagemDiv.classList.add('erro');
        }
    });
});