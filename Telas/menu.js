document.addEventListener('DOMContentLoaded', () => {

    const logoutButton = document.querySelector('.logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            alert('Botão "Sair" clicado!');
            console.log('Evento: Logout');
        });
    }

    const cardButtons = document.querySelectorAll('.card button');
    
    cardButtons.forEach(button => {
        button.addEventListener('click', () => {
            const card = button.closest('.card');
            const title = card.querySelector('h3').innerText;
            
            alert(`Ação: "${title}" foi clicada!`);
            console.log(`Evento: Card "${title}"`);
        });
    });

    const navLinks = document.querySelectorAll('.navigation li a');

    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {

            navLinks.forEach(nav => nav.classList.remove('active'));
            
            link.classList.add('active');

            const linkText = link.querySelector('span').innerText;
            console.log(`Navegação: ${linkText}`);
        });
    });

});