document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('form-login');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const mensagemDiv = document.getElementById('mensagem');

    form.addEventListener('submit', async (evento) => {
        evento.preventDefault();

        const email = emailInput.value;
        const senha = passwordInput.value;
        
        mensagemDiv.innerText = '';
        mensagemDiv.className = '';

        try {
            const resposta = await fetch('http://localhost:3333/api/v1/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email, senha: senha }),
            });

            const resultado = await resposta.json();

            if (!resposta.ok) {
                mensagemDiv.innerText = resultado.error || 'Erro ao fazer login.';
                mensagemDiv.className = 'erro'; 
            } else {
                localStorage.setItem('notadez_token', resultado.token);
                localStorage.setItem('notadez_docente', JSON.stringify(resultado.docente));
                window.location.href = 'menu.html'; 
            }

        } catch (erro) {
            console.error('Erro de rede:', erro);
            mensagemDiv.innerText = 'Erro de conexão com o servidor.';
            mensagemDiv.className = 'erro';
        }
    });
});