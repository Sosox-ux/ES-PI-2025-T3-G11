// -- Feito por Sophia :) --

// Adiciona um ouvinte de evento que é acionado quando o DOM está totalmente carregado.
document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('form-resetar');
    const emailInput = document.getElementById('email');
    const codigoInput = document.getElementById('codigo');
    const novaSenhaInput = document.getElementById('nova-senha');
    const confirmaSenhaInput = document.getElementById('confirma-nova-senha');
    const mensagemDiv = document.getElementById('mensagem');
    const submitButton = form.querySelector('button[type="submit"]');


    // Adiciona um ouvinte de evento para o envio do formulário.
    form.addEventListener('submit', async (evento) => {
        // Previne o comportamento padrão de envio do formulário.
        evento.preventDefault();
        
     
        // Limpa a mensagem de feedback e desabilita o botão de envio.
        mensagemDiv.innerText = '';
        mensagemDiv.className = '';
        submitButton.disabled = true;
        submitButton.innerText = 'Salvando...';

       
        // Obtém os valores dos campos do formulário.
        const email = emailInput.value;
        const codigo = codigoInput.value;
        const novaSenha = novaSenhaInput.value;
        const confirmaSenha = confirmaSenhaInput.value;

        
        // Verifica se as novas senhas coincidem.
        if (novaSenha !== confirmaSenha) {
            mensagemDiv.innerText = 'As novas senhas não conferem.';
            mensagemDiv.style.color = 'red';
            submitButton.disabled = false;
            submitButton.innerText = 'Salvar Nova Senha';
            return; 
        }
        
     
        // Cria um objeto com os dados para redefinir a senha.
        const dadosReset = {
            email: email,
            codigo: codigo,
            novaSenha: novaSenha
        };

        try {
         
            // Envia os dados para a API para redefinir a senha.
            const resposta = await fetch('http://localhost:3333/api/v1/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dadosReset),
            });

            const resultado = await resposta.json();

        
            // Lança um erro se a resposta não for bem-sucedida.
            if (!resposta.ok) {
            
                throw new Error(resultado.error || 'Erro no servidor');
            }
            
    
            // Exibe uma mensagem de sucesso e redireciona para a página de início.
            mensagemDiv.innerText = 'Senha alterada com sucesso! Redirecionando para o login...';
            mensagemDiv.style.color = 'green';
            form.reset(); 

          
            setTimeout(() => {
                window.location.href = 'inicio.html';
            }, 3000);

        } catch (erro) {
        
            // Exibe uma mensagem de erro se houver um problema de rede.
            console.error('Erro ao resetar senha:', erro);
            mensagemDiv.innerText = `Erro: ${erro.message}`;
            mensagemDiv.style.color = 'red';
            submitButton.disabled = false;
            submitButton.innerText = 'Salvar Nova Senha';
        }
    });
});
