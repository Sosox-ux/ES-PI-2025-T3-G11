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
        const telefone = document.getElementById('phone').value;
        const senha = document.getElementById('password').value;
        const confirmaSenha = document.getElementById('password_confirmation').value;

        
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
            // (Mude 'http://localhost:3333' para a URL do seu backend se for diferente)
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
                    window.location.href = 'login.html'; 
                }, 2000);
            }

        } catch (erro) {
            console.error('Erro de rede:', erro);
            mensagemDiv.innerText = 'Erro ao conectar com o servidor. Tente novamente.';
            mensagemDiv.classList.add('erro');
        }
    });
});