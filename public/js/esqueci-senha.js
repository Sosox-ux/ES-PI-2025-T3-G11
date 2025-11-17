// -- Feito por Sophia :) --

// Adiciona um ouvinte de evento que é acionado quando o DOM está totalmente carregado.
document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('form-esqueci');
    const emailInput = document.getElementById('email');
    const mensagemDiv = document.getElementById('mensagem');
    const submitButton = form.querySelector('button[type="submit"]');

    // Adiciona um ouvinte de evento para o envio do formulário.
    form.addEventListener('submit', async (evento) => {
        // Previne o comportamento padrão de envio do formulário.
        evento.preventDefault(); 

       
        // Desabilita o botão de envio e atualiza o texto.
        submitButton.disabled = true;
        submitButton.innerText = 'Enviando...';
        mensagemDiv.innerText = '';
        mensagemDiv.className = '';

        const email = emailInput.value;

        try {
          
            // Envia o e-mail para a API para solicitar a redefinição de senha.
            const resposta = await fetch('http://localhost:3333/api/v1/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email }),
            });

            const resultado = await resposta.json();

           
            // Lança um erro se a resposta não for bem-sucedida.
            if (!resposta.ok) {
               
                throw new Error(resultado.error || 'Erro no servidor');
            }
            
         
            // Exibe uma mensagem de sucesso e desabilita o campo de e-mail.
            mensagemDiv.innerText = resultado.message;
            mensagemDiv.style.color = 'green';
            emailInput.disabled = true; 
            submitButton.innerText = 'Enviado!';
            
            // Redireciona para a página de confirmação após 2 segundos.
            setTimeout(() => {
                window.location.href = 'esquecisenha2.html';
            }, 2000); 


        } catch (erro) {
            // Exibe uma mensagem de erro se houver um problema de rede.
            console.error('Erro ao pedir reset:', erro);
            mensagemDiv.innerText = 'Erro ao conectar com o servidor.';
            mensagemDiv.style.color = 'red';
            submitButton.disabled = false; 
            submitButton.innerText = 'Enviar';
        }
    });
});
