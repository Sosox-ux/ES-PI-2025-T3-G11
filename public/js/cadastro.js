function showRequirements() {
  document.getElementById('password-requirements').style.display = 'block';
}

function validatePassword() {
  const password = document.getElementById('senha').value;
  

  const lengthReq = document.getElementById('req-length');
  const numberReq = document.getElementById('req-number');
  const upperReq = document.getElementById('req-upper');
  const specialReq = document.getElementById('req-special');

  const hasNumber = /\d/;                
  const hasUpper = /[A-Z]/;            
  const hasSpecial = /[!@#$%^&*()]/;  
  

  if (password.length >= 8) {
    lengthReq.style.color = 'green';
  } else {
    lengthReq.style.color = 'red';
  }


  if (hasNumber.test(password)) {
    numberReq.style.color = 'green';
  } else {
    numberReq.style.color = 'red';
  }

  if (hasUpper.test(password)) {
    upperReq.style.color = 'green';
  } else {
    upperReq.style.color = 'red';
  }
  

  if (hasSpecial.test(password)) {
    specialReq.style.color = 'green';
  } else {
    specialReq.style.color = 'red';
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