// -- Feito por Sophia :) --

// Mostra a caixa de requisitos de senha quando o campo de senha está em foco.
function showRequirements() {
        const reqBox = document.getElementById('password-requirements');
        reqBox.classList.add('show');
    }

    // Valida a senha em tempo real, verificando se atende aos requisitos.
    function validatePassword() {
        const password = document.getElementById('senha').value;

        // Valida o comprimento da senha (mínimo de 8 caracteres).
        const lengthReq = document.getElementById('req-length');
        if (password.length >= 8) {
            lengthReq.classList.add('valid');
        } else {
            lengthReq.classList.remove('valid');
        }

        // Valida se a senha contém pelo menos uma letra maiúscula.
        const upperReq = document.getElementById('req-lowercase');
        if (/[A-Z]/.test(password)) {
            upperReq.classList.add('valid');
        } else {
            upperReq.classList.remove('valid');
        }

        // Valida se a senha contém pelo menos um número.
        const numberReq = document.getElementById('req-number');
        if (/\d/.test(password)) {
            numberReq.classList.add('valid');
        } else {
            numberReq.classList.remove('valid');
        }

        // Valida se a senha contém pelo menos um caractere especial.
        const specialReq = document.getElementById('req-special');
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            specialReq.classList.add('valid');
        } else {
            specialReq.classList.remove('valid');
        }
    }

    // Adiciona um ouvinte de evento ao campo de telefone para formatar o número enquanto o usuário digita.
    const inputTelefone = document.getElementById('telefone');

inputTelefone.addEventListener('input', (e) => {
    // Remove todos os caracteres não numéricos.
    let valor = e.target.value.replace(/\D/g, '');

    // Limita o número de dígitos a 11.
    valor = valor.substring(0, 11);

    // Aplica a formatação (XX) XXXXX-XXXX.
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

    // Atualiza o valor no campo de entrada.
    e.target.value = valorFormatado;
});


// Adiciona um ouvinte de evento que é acionado quando o DOM está totalmente carregado.
document.addEventListener('DOMContentLoaded', () => {
    
    const form = document.getElementById('form-cadastro');
    const mensagemDiv = document.getElementById('mensagem');
     
    // Adiciona um ouvinte de evento para o envio do formulário.
    form.addEventListener('submit', async (evento) => {
        
        // Previne o comportamento padrão de envio do formulário.
        evento.preventDefault();
        
        // Limpa a mensagem de feedback.
        mensagemDiv.innerText = '';
        mensagemDiv.className = 'mensagem-feedback';

        
        // Obtém os valores dos campos do formulário.
        const nome = document.getElementById('nome').value;
        const sobrenome = document.getElementById('sobrenome').value;
        const email = document.getElementById('email').value;
        const telefone = document.getElementById('telefone').value;
        const senha = document.getElementById('senha').value;
        const confirmaSenha = document.getElementById('senhaconf').value;

        
        // Verifica se as senhas coincidem.
        if (senha !== confirmaSenha) {
            mensagemDiv.innerText = 'As senhas não conferem.';
            mensagemDiv.classList.add('erro'); 
            return; 
        }
        
        // Cria um objeto com os dados de cadastro.
        const dadosDeCadastro = {
            nome: `${nome} ${sobrenome}`,
            telefone: telefone,
            email: email,
            senha: senha
        };

        try {
            // Envia os dados de cadastro para a API.
            const resposta = await fetch('http://localhost:3333/api/v1/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dadosDeCadastro),
            });

            const resultado = await resposta.json();

            // Exibe uma mensagem de erro se o cadastro falhar.
            if (!resposta.ok) {
                mensagemDiv.innerText = `Erro: ${resultado.error || 'Não foi possível cadastrar'}`;
                mensagemDiv.classList.add('erro');
            } else {
                // Exibe uma mensagem de sucesso e redireciona para a página de início.
                mensagemDiv.innerText = 'Cadastro realizado com sucesso! Você será redirecionado...';
                mensagemDiv.classList.add('sucesso'); 
                form.reset(); 
                
                setTimeout(() => {
                    window.location.href = 'inicio.html'; 
                }, 2000);
            }

        } catch (erro) {
            // Exibe uma mensagem de erro se houver um problema de rede.
            console.error('Erro de rede:', erro);
            mensagemDiv.innerText = 'Erro ao conectar com o servidor. Tente novamente.';
            mensagemDiv.classList.add('erro');
        }
    });
});
