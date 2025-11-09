document.addEventListener('DOMContentLoaded', () => {

    const docenteString = localStorage.getItem('notadez_docente');
    

    if (!docenteString) {
        alert('Você não está autenticado. Faça o login.');
        window.location.href = 'login.html';
        return;
    }

    const docente = JSON.parse(docenteString);
    

    const nomeElemento = document.getElementById('nome-docente-logado');
    
    if (nomeElemento && docente.nome) {
        nomeElemento.innerText = docente.nome;
    }

    const btnSair = document.getElementById('btn-sair');
    
    if (btnSair) {
        btnSair.addEventListener('click', () => {
            localStorage.removeItem('notadez_token');
            localStorage.removeItem('notadez_docente');
            
            window.location.href = 'inicio.html';
        });
    }

    


});