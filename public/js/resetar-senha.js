document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('form-resetar');
    const emailInput = document.getElementById('email');
    const codigoInput = document.getElementById('codigo');
    const novaSenhaInput = document.getElementById('nova-senha');
    const confirmaSenhaInput = document.getElementById('confirma-nova-senha');
    const mensagemDiv = document.getElementById('mensagem');
    const submitButton = form.querySelector('button[type="submit"]');


    form.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        
     
        mensagemDiv.innerText = '';
        mensagemDiv.className = '';
        submitButton.disabled = true;
        submitButton.innerText = 'Salvando...';

       
        const email = emailInput.value;
        const codigo = codigoInput.value;
        const novaSenha = novaSenhaInput.value;
        const confirmaSenha = confirmaSenhaInput.value;

        
        if (novaSenha !== confirmaSenha) {
            mensagemDiv.innerText = 'As novas senhas não conferem.';
            mensagemDiv.style.color = 'red';
            submitButton.disabled = false;
            submitButton.innerText = 'Salvar Nova Senha';
            return; 
        }
        
     
        const dadosReset = {
            email: email,
            codigo: codigo,
            novaSenha: novaSenha
        };

        try {
         
            const resposta = await fetch('http://localhost:3333/api/v1/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dadosReset),
            });

            const resultado = await resposta.json();

        
            if (!resposta.ok) {
            
                throw new Error(resultado.error || 'Erro no servidor');
            }
            
    
            mensagemDiv.innerText = 'Senha alterada com sucesso! Redirecionando para o login...';
            mensagemDiv.style.color = 'green';
            form.reset(); 

          
            setTimeout(() => {
                window.location.href = 'inicio.html';
            }, 3000);

        } catch (erro) {
        
            console.error('Erro ao resetar senha:', erro);
            mensagemDiv.innerText = `Erro: ${erro.message}`;
            mensagemDiv.style.color = 'red';
            submitButton.disabled = false;
            submitButton.innerText = 'Salvar Nova Senha';
        }
    });
});