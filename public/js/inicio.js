// -- Feito por Sophia :) --

// Adiciona um ouvinte de evento que é acionado quando o DOM está totalmente carregado.
document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('form-login');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const mensagemDiv = document.getElementById('mensagem');

    // Adiciona um ouvinte de evento para o envio do formulário.
    form.addEventListener('submit', async (evento) => {
        // Previne o comportamento padrão de envio do formulário.
        evento.preventDefault();

        const email = emailInput.value;
        const senha = passwordInput.value;
        
        // Limpa a mensagem de feedback.
        mensagemDiv.innerText = '';
        mensagemDiv.className = '';

        try {
            // Envia os dados de login para a API.
            const resposta = await fetch('http://localhost:3333/api/v1/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email, senha: senha }),
            });

            const resultado = await resposta.json();

            // Exibe uma mensagem de erro se o login falhar.
            if (!resposta.ok) {
                mensagemDiv.innerText = resultado.error || 'Erro ao fazer login.';
                mensagemDiv.className = 'erro'; 
            } else {
                // Armazena o token e os dados do docente no localStorage e redireciona para a página do menu.
                localStorage.setItem('notadez_token', resultado.token);
                localStorage.setItem('notadez_docente', JSON.stringify(resultado.docente));
                window.location.href = 'menu.html'; 
            }

        } catch (erro) {
            // Exibe uma mensagem de erro se houver um problema de rede.
            console.error('Erro de rede:', erro);
            mensagemDiv.innerText = 'Erro de conexão com o servidor.';
            mensagemDiv.className = 'erro';
        }
    });
});
