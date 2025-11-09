document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('form-esqueci');
    const emailInput = document.getElementById('email');
    const mensagemDiv = document.getElementById('mensagem');
    const submitButton = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (evento) => {
        evento.preventDefault(); 

       
        submitButton.disabled = true;
        submitButton.innerText = 'Enviando...';
        mensagemDiv.innerText = '';
        mensagemDiv.className = '';

        const email = emailInput.value;

        try {
          
            const resposta = await fetch('http://localhost:3333/api/v1/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email }),
            });

            const resultado = await resposta.json();

           
            if (!resposta.ok) {
               
                throw new Error(resultado.error || 'Erro no servidor');
            }
            
         
            mensagemDiv.innerText = resultado.message;
            mensagemDiv.style.color = 'green';
            emailInput.disabled = true; 
            submitButton.innerText = 'Enviado!';
            
            setTimeout(() => {
                window.location.href = 'esquecisenha2.html';
            }, 2000); 


        } catch (erro) {
            console.error('Erro ao pedir reset:', erro);
            mensagemDiv.innerText = 'Erro ao conectar com o servidor.';
            mensagemDiv.style.color = 'red';
            submitButton.disabled = false; 
            submitButton.innerText = 'Enviar';
        }
    });
});