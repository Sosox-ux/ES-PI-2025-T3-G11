// -- Feito por Clara e Sophia :) --

// =======================================================
// CÉREBRO
// =======================================================
// Objeto de dados global para armazenar informações da aplicação.
let data = {
    notas: [],
    instituicoes: [],
    turmas: [],
    disciplinas: [],
    alunos: [] // Lista mestre de todos os alunos do docente
};

// =======================================================
// FUNÇÕES GLOBAIS
// =======================================================
// Realiza o logout do usuário, removendo os dados do localStorage e redirecionando para a página de início.
function suaLogout() {
    localStorage.removeItem('notadez_token');
    localStorage.removeItem('notadez_docente');
    window.location.href = 'inicio.html';
}

// Exibe os detalhes de uma instituição em um modal.
function showInstituicaoDetails(id) {
    const inst = data.instituicoes.find(i => i.ID_INSTITUICAO === id);
    if (!inst) return;
    const alunosDaInst = data.alunos.filter(a => a.FK_ID_INSTITUICAO === id);
    const turmasDaInst = data.turmas.filter(t => t.FK_ID_INSTITUICAO === id);
    document.getElementById('modalInstituicaoNome').textContent = inst.NOME;
    document.getElementById('modalTotalAlunos').textContent = alunosDaInst.length;
    document.getElementById('modalTotalTurmas').textContent = turmasDaInst.length;
    document.getElementById('modalDetalhes').classList.add('show');
}

// Fecha o modal de detalhes.
function closeModal() {
    document.getElementById('modalDetalhes').classList.remove('show');
}

// =======================================================
// FUNÇÕES UTILITÁRIAS (Toast, Stats, Selects)
// =======================================================

// Exibe uma mensagem de toast (notificação).
function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    if (toast && toastMessage) {
        toastMessage.textContent = message;
        toast.className = isError ? 'toast error show' : 'toast show';
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
}

// Atualiza as estatísticas (total de alunos, disciplinas, etc.).
function updateStats() {
    document.getElementById('totalAlunos').textContent = data.alunos.length;
    document.getElementById('totalDisciplinas').textContent = data.disciplinas.length;
    document.getElementById('totalInstituicoes').textContent = data.instituicoes.length;
    
    // Calcula o total de turmas de todas as instituições
    const totalTurmas = data.instituicoes.reduce((acc, inst) => {
        return acc + (data.turmas.filter(t => t.FK_ID_INSTITUICAO === inst.ID_INSTITUICAO).length);
    }, 0);
    // Para simplificar, vamos usar o tamanho do array data.turmas que é carregado dinamicamente
    document.getElementById('totalTurmas').textContent = data.turmas.length;
}


// Atualiza todos os selects da página com os dados mais recentes.
function updateAllSelects() {
    const instituicaoSelects = [
        'turmaInstituicao', 'alunoInstituicao', 'notaInstituicaoFiltro'
    ];
    instituicaoSelects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            const currentValue = select.value;
            select.innerHTML = '<option value="">Selecione uma instituição</option>';
            data.instituicoes.forEach(inst => {
                const option = new Option(inst.NOME, inst.ID_INSTITUICAO);
                select.appendChild(option);
            });
            select.value = currentValue;
        }
    });

    const disciplinaSelects = ['turmaDisciplina', 'notaDisciplinaFiltro'];
    disciplinaSelects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            const currentValue = select.value;
            select.innerHTML = '<option value="">Selecione uma disciplina</option>';
            data.disciplinas.forEach(disc => {
                const option = new Option(disc.NOME, disc.ID_DISCIPLINA);
                select.appendChild(option);
            });
            select.value = currentValue;
            select.disabled = (data.disciplinas.length === 0);
        }
    });

    // Chama as funções específicas para atualizar turmas dependentes
    updateTurmaSelects('alunoInstituicao', 'alunoTurma');
    updateTurmaSelects('notaInstituicaoFiltro', 'notaTurmaFiltro', document.getElementById('notaDisciplinaFiltro').value);
}


// Atualiza os selects de turma com base na instituição e disciplina selecionadas.
function updateTurmaSelects(idSelectInstituicao, idSelectTurma, idDisciplina = null) {
    const turmaSelect = document.getElementById(idSelectTurma);
    const instituicaoId = document.getElementById(idSelectInstituicao).value;
    
    if (turmaSelect) {
        const currentValue = turmaSelect.value;
        turmaSelect.innerHTML = '<option value="">Selecione uma turma</option>';
        
        let turmasFiltradas = [];
        if (instituicaoId) {
            turmasFiltradas = data.turmas.filter(t => t.FK_ID_INSTITUICAO == instituicaoId);
            if (idDisciplina) {
                turmasFiltradas = turmasFiltradas.filter(t => t.FK_ID_DISCIPLINA == idDisciplina);
            }
        }
        
        turmasFiltradas.forEach(turma => {
            const option = new Option(turma.NOME, turma.ID_TURMA);
            turmaSelect.appendChild(option);
        });
        
        turmaSelect.value = currentValue;
        turmaSelect.disabled = !instituicaoId || (idDisciplina === null ? false : !idDisciplina);
    }
}

// Formata a nota para o intervalo de 0.0 a 10.0 ao sair do campo de entrada.
function formatarInputNota(input) {
    let valor = parseFloat(input.value);

    // Se o campo estiver vazio, não faz nada
    if (isNaN(valor)) {
        input.value = "";
        return;
    }

    // Limita entre 0 e 10 
    if (valor < 0) valor = 0;
    if (valor > 10) valor = 10;

    // Formata para 1 casa decimal (ex: 5 vira "5.0")
    // .toFixed(1) retorna uma string
    input.value = valor.toFixed(2);

    // Marca o campo como "sujo" (alterado) para o botão Salvar ativar
    input.dataset.dirty = 'true';
}

// Recalcula a nota final de um aluno com base nas notas e pesos dos componentes.
function recalcularNotaFinal(idInscricao) {
    // 1. Pega todos os inputs de nota desse aluno
    const inputs = document.querySelectorAll(`.nota-input[data-id-inscricao="${idInscricao}"]`);
    
    let somaPonderada = 0;
    let somaPesos = 0;

    inputs.forEach(input => {
        // Pega o valor digitado (ou 0 se vazio)
        let valor = parseFloat(input.value);
        if (isNaN(valor)) valor = 0;

        // Pega o peso que guardamos no atributo data-peso (ou 1 se não tiver)
        let peso = parseFloat(input.dataset.peso);
        if (isNaN(peso)) peso = 1;

        somaPonderada += (valor * peso);
        somaPesos += peso;
    });

    // 2. Calcula a média
    // (Evita divisão por zero)
    const media = somaPesos > 0 ? (somaPonderada / somaPesos).toFixed(1) : "0.00";

    // 3. Atualiza a célula da Nota Final na tela
    const celulaFinal = document.getElementById(`nota-final-${idInscricao}`);
    if (celulaFinal) {
        celulaFinal.innerText = media;
        celulaFinal.style.color = parseFloat(media) >= 6.0 ? 'green' : 'red';
    }
}

// =======================================================
// ===== INSTITUIÇÕES =====
// =======================================================

// Renderiza a tabela de instituições.
function renderInstituicoes(filteredInstituicoes = null) {
    const container = document.getElementById('instituicoesTableContainer');
    const instituicoesToRender = filteredInstituicoes || data.instituicoes;
    if (instituicoesToRender.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-building"></i><h3>Nenhuma instituição cadastrada</h3><p>Adicione a primeira instituição usando o formulário acima</p></div>`;
        return;
    }
    let html = `<table><thead><tr><th>Nome</th><th>Local</th><th>Ações</th></tr></thead><tbody>`;
    instituicoesToRender.forEach(inst => {
        html += `
            <tr>
                <td><strong>${inst.NOME}</strong></td>
                <td>${inst.LOCAL || 'N/A'}</td>
                <td>
                    <button class="btn-remove" onclick="removeInstituicao(${inst.ID_INSTITUICAO})">
                        <i class="fas fa-trash"></i> Remover
                    </button>
                </td>
            </tr>
        `;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}

// Remove uma instituição.
async function removeInstituicao(id) {
    if (!confirm('Deseja realmente remover esta instituição? Todas as turmas e alunos associados serão perdidos.')) return;
    const token = localStorage.getItem('notadez_token');
    try {
        const resposta = await fetch(`http://localhost:3333/api/v1/instituicoes/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resposta.status === 409) {
            const erro = await resposta.json(); throw new Error(erro.error);
        }
        if (!resposta.ok && resposta.status !== 204) {
             const erro = await resposta.json(); throw new Error(erro.error || 'Não foi possível deletar.');
        }
        showToast('Instituição removida com sucesso!');
        loadInstituicoes();
    } catch (erro) {
        console.error('Erro ao remover instituição:', erro);
        showToast(`Erro: ${erro.message}`, true);
    }
}

// Carrega as instituições do servidor.
async function loadInstituicoes() {
    const token = localStorage.getItem('notadez_token');
    if (!token) return; 
    try {
        const resposta = await fetch('http://localhost:3333/api/v1/instituicoes', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!resposta.ok) {
            const erro = await resposta.json(); throw new Error(erro.error);
        }
        data.instituicoes = await resposta.json();
        renderInstituicoes();
        updateAllSelects();
        updateStats();
    } catch (erro) {
        console.error('Erro ao carregar instituições:', erro);
        showToast(`Erro ao carregar dados: ${erro.message}`, true);
    }
}

// =======================================================
// ===== TURMAS =====
// =======================================================

// Renderiza a tabela de turmas.
function renderTurmas(filteredTurmas = null) {
    const container = document.getElementById('turmasTableContainer');
    const turmasToRender = filteredTurmas || data.turmas;
    if (turmasToRender.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-users"></i><h3>Nenhuma turma cadastrada</h3><p>Selecione uma instituição e adicione a primeira turma.</p></div>`;
        return;
    }
    let html = `<table><thead><tr><th>Nome da Turma</th><th>Código</th><th>Apelido</th><th>Disciplina</th><th>Ações</th></tr></thead><tbody>`;
    turmasToRender.forEach(turma => {
        const disciplina = data.disciplinas.find(d => d.ID_DISCIPLINA === turma.FK_ID_DISCIPLINA);
        html += `
            <tr>
                <td><strong>${turma.NOME}</strong></td>
                <td>${turma.CODIGO || 'N/A'}</td>
                <td>${turma.APELIDO || 'N/A'}</td>
                <td>${disciplina ? disciplina.NOME : 'N/A'}</td>
                <td>
                    <button class="btn-remove" onclick="removeTurma(${turma.ID_TURMA})">
                        <i class="fas fa-trash"></i> Remover
                    </button>
                </td>
            </tr>
        `;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}

// Remove uma turma.
async function removeTurma(id) {
    if (!confirm('Deseja realmente remover esta turma? As inscrições dos alunos serão perdidas.')) return;
    const token = localStorage.getItem('notadez_token');
    try {
        const resposta = await fetch(`http://localhost:3333/api/v1/turmas/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resposta.status === 409) { 
            const erro = await resposta.json(); throw new Error(erro.error);
        }
        if (!resposta.ok && resposta.status !== 204) {
             const erro = await resposta.json(); throw new Error(erro.error || 'Não foi possível deletar.');
        }
        showToast('Turma removida com sucesso!');
        const idInstituicaoAtiva = document.getElementById('turmaInstituicao').value;
        loadTurmas(idInstituicaoAtiva);
    } catch (erro) {
        console.error('Erro ao remover turma:', erro);
        showToast(`Erro: ${erro.message}`, true);
    }
}

// Carrega as turmas de uma instituição específica.
async function loadTurmas(idInstituicao) {
    const token = localStorage.getItem('notadez_token');
    const container = document.getElementById('turmasTableContainer');
    if (!token || !idInstituicao) {
        data.turmas = [];
        renderTurmas();
        updateAllSelects();
        updateStats();
        return;
    }
    container.innerHTML = '<div class="empty-state"><i class="fas fa-spinner fa-spin"></i> Carregando turmas...</div>';
    try {
        const resposta = await fetch(`http://localhost:3333/api/v1/turmas/instituicao/${idInstituicao}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!resposta.ok) throw new Error((await resposta.json()).error);
        
        data.turmas = await resposta.json();
        renderTurmas();
        updateAllSelects();
        updateStats();
    } catch (erro) {
        console.error('Erro ao carregar turmas:', erro);
        showToast(`Erro ao carregar turmas: ${erro.message}`, true);
        container.innerHTML = '<div class="empty-state">Erro ao carregar turmas.</div>';
    }
}

// Carrega todas as turmas do docente.
async function loadAllTurmas() {
    const token = localStorage.getItem('notadez_token');
    if (!token) return;
    try {
        const resposta = await fetch(`http://localhost:3333/api/v1/turmas`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!resposta.ok) throw new Error((await resposta.json()).error);
        data.turmas = await resposta.json();
        renderTurmas();
        updateAllSelects();
        updateStats();
    } catch (erro) {
        console.error('Erro ao carregar todas as turmas:', erro);
        showToast(`Erro ao carregar turmas: ${erro.message}`, true);
    }
}

// =======================================================
// ===== DISCIPLINAS =====
// =======================================================

// Renderiza a tabela de disciplinas.
function renderDisciplinas(filteredDisciplinas = null) {
    const container = document.getElementById('disciplinasTableContainer');
    const disciplinasToRender = filteredDisciplinas || data.disciplinas;
    if (disciplinasToRender.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-book"></i><h3>Nenhuma disciplina cadastrada</h3><p>Adicione a primeira disciplina usando o formulário acima</p></div>`;
        return;
    }
    let html = `<table><thead><tr><th>Nome</th><th>Sigla</th><th>Código</th><th>Período</th><th>Ações</th></tr></thead><tbody>`;
    disciplinasToRender.forEach(disc => {
        html += `
            <tr>
                <td><strong>${disc.NOME}</strong></td>
                <td>${disc.SIGLA || 'N/A'}</td>
                <td>${disc.CODIGO || 'N/A'}</td>
                <td>${disc.PERIODO_CURSO || 'N/A'}</td>
                <td>
                    <button class="btn-remove" onclick="removeDisciplina(${disc.ID_DISCIPLINA})">
                        <i class="fas fa-trash"></i> Remover
                    </button>
                </td>
            </tr>
        `;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}

// Remove uma disciplina.
async function removeDisciplina(id) {
    if (!confirm('Deseja realmente remover esta disciplina?')) return;
    const token = localStorage.getItem('notadez_token');
    try {
        const resposta = await fetch(`http://localhost:3333/api/v1/disciplinas/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resposta.status === 409) { 
            const erro = await resposta.json(); throw new Error(erro.error);
        }
        if (!resposta.ok && resposta.status !== 204) {
             const erro = await resposta.json(); throw new Error(erro.error || 'Não foi possível deletar.');
        }
        showToast('Disciplina removida com sucesso!');
        loadDisciplinas();
    } catch (erro) {
        console.error('Erro ao remover disciplina:', erro);
        showToast(`Erro: ${erro.message}`, true);
    }
}

// Carrega as disciplinas do servidor.
async function loadDisciplinas() {
    const token = localStorage.getItem('notadez_token');
    if (!token) return; 
    try {
        const resposta = await fetch(`http://localhost:3333/api/v1/disciplinas`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!resposta.ok) throw new Error((await resposta.json()).error);
        data.disciplinas = await resposta.json();
        renderDisciplinas();
        updateAllSelects();
        updateStats();
    } catch (erro) {
        console.error('Erro ao carregar disciplinas:', erro);
        showToast(`Erro ao carregar disciplinas: ${erro.message}`, true);
    }
}

// =======================================================
// ===== ALUNOS =====
// =======================================================

// Renderiza a tabela de alunos.
function renderAlunos(alunosParaRenderizar) {
    const container = document.getElementById('alunosTableContainer');
    const idTurmaSelecionada = document.getElementById('alunoTurma').value;

    if (!alunosParaRenderizar || alunosParaRenderizar.length === 0) {
        const emptyMessage = idTurmaSelecionada
            ? '<h3>Nenhum aluno nesta turma</h3><p>Adicione alunos usando o formulário acima ou selecione outra turma.</p>'
            : '<h3>Nenhum aluno encontrado</h3><p>Você pode cadastrar novos alunos ou filtrar por uma turma específica.</p>';
        container.innerHTML = `<div class="empty-state"><i class="fas fa-user-graduate"></i>${emptyMessage}</div>`;
        return;
    }
    
    let html = `<table><thead><tr><th>Nome</th><th>Matrícula</th><th>Ações</th></tr></thead><tbody>`;
    alunosParaRenderizar.forEach(aluno => {
        const actionButton = aluno.ID_INSCRICAO
            ? `<button class="btn-remove" onclick="removeInscricao(${aluno.ID_INSCRICAO})">
                   <i class="fas fa-trash"></i> Desinscrever
               </button>`
            : `<button class="btn-remove" onclick="excluirAlunoTotalmente(${aluno.ID_ALUNO})">
                    <i class="fas fa-trash"></i> Excluir
                </button>`;

        html += `
            <tr>
                <td><strong>${aluno.NOME_COMPLETO}</strong></td>
                <td>${aluno.MATRICULA}</td>
                <td>${actionButton}</td>
            </tr>
        `;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}

// Remove a inscrição de um aluno de uma turma.
async function removeInscricao(idInscricao) {
    if (!confirm('Deseja realmente desinscrever este aluno desta turma? (Ele não será deletado da sua lista mestra).')) return;
    const token = localStorage.getItem('notadez_token');
    try {
        const resposta = await fetch(`http://localhost:3333/api/v1/alunos/inscricao/${idInscricao}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!resposta.ok && resposta.status !== 204) {
            const erro = await resposta.json(); throw new Error(erro.error || 'Não foi possível desinscrever.');
        }
        showToast('Aluno desinscrito com sucesso!');
        loadAlunos(document.getElementById('alunoTurma').value);
    } catch (erro) {
        console.error('Erro ao remover inscrição:', erro);
        showToast(`Erro: ${erro.message}`, true);
    }
}

//EXCLUIR O ALUNO DO SISTEMA (Apaga da tabela ALUNO)
async function excluirAlunoTotalmente(idAluno) {
    if (!confirm('ATENÇÃO: Isso excluirá o aluno permanentemente de TODAS as turmas e apagará todas as suas notas. Tem certeza?')) {
        return;
    }
    
    const token = localStorage.getItem('notadez_token');
    
    try {
        // Chama a rota no controller (excluirTotalmente)
        // Supondo que a rota seja DELETE /api/v1/alunos/:idAluno
        const resposta = await fetch(`http://localhost:3333/api/v1/alunos/${idAluno}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!resposta.ok && resposta.status !== 204) {
             const erro = await resposta.json();
            throw new Error(erro.error || 'Não foi possível excluir o aluno.');
        }

        showToast('Aluno excluído do sistema com sucesso!');
        
        // Recarrega a lista mestra
        loadTodosAlunos(); 

    } catch (erro) {
        console.error('Erro ao excluir aluno:', erro);
        showToast(`Erro: ${erro.message}`, true);
    }
}

// Carrega todos os alunos do docente.
async function loadTodosAlunos() {
    const token = localStorage.getItem('notadez_token');
    if (!token) return;

    const container = document.getElementById('alunosTableContainer');
    if (data.alunos.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-spinner fa-spin"></i> Carregando alunos...</div>';
    }

    try {
        const resposta = await fetch(`http://localhost:3333/api/v1/alunos`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!resposta.ok) {
            const erro = await resposta.json();
            throw new Error(erro.error || 'Erro ao buscar alunos');
        }

        const alunosDoBanco = await resposta.json();
        data.alunos = alunosDoBanco; 
        
        renderAlunos(alunosDoBanco); 
        updateStats();  

    } catch (erro) {
        console.error('Erro ao carregar todos os alunos:', erro);
        if (erro.message.includes("SyntaxError")) {
            showToast("Erro de conexão: Backend não encontrou a rota de alunos.", true);
        } else {
            showToast(`Erro: ${erro.message}`, true);
        }
        container.innerHTML = '<div class="empty-state">Erro ao carregar alunos.</div>';
    }
}

// Carrega os alunos de uma turma específica.
async function loadAlunos(idTurma) {
    const token = localStorage.getItem('notadez_token');
    const container = document.getElementById('alunosTableContainer');
    
    if (!token) return;

    container.innerHTML = '<div class="empty-state"><i class="fas fa-spinner fa-spin"></i> Carregando alunos...</div>';

    try {
        let url;
        if (idTurma) {
            // Se tem turma selecionada, busca por turma
            url = `http://localhost:3333/api/v1/alunos/turma/${idTurma}`;
        } else {
            // Se NÃO tem turma (vazio), busca TODOS (lista mestra)
            url = `http://localhost:3333/api/v1/alunos`;
        }

        const resposta = await fetch(url, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!resposta.ok) {
            const erro = await resposta.json();
            throw new Error(erro.error || 'Erro ao carregar alunos');
        }
        
        const alunos = await resposta.json();
        data.alunos = alunos; // Atualiza a memória global
        renderAlunos(alunos); // Desenha a tabela
        updateStats(); // Atualiza os números

    } catch (erro) {
        console.error('Erro ao carregar alunos:', erro);
        showToast(`Erro ao carregar alunos: ${erro.message}`, true);
        container.innerHTML = '<div class="empty-state">Erro ao carregar alunos.</div>';
    }
}
// =======================================================
// ===== NOTAS =====
// =======================================================

// Renderiza a grade de notas para uma turma e disciplina específicas.
async function renderNotasGrid(idTurma, idDisciplina) {
    const container = document.getElementById('notasGridContainer');
    const btnSalvar = document.getElementById('btnSalvarNotas');
    const btnExportar = document.getElementById('btnExportarCsv');

    if (!idTurma || !idDisciplina) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-filter"></i><h3>Selecione os filtros acima</h3><p>Escolha uma instituição, disciplina e turma para visualizar a grade de notas.</p></div>`;
        btnSalvar.style.display = 'none';
        btnExportar.style.display = 'none'; 
        return;
    }
    
    container.innerHTML = '<div class="empty-state"><i class="fas fa-spinner fa-spin"></i> Carregando grade...</div>';
    btnSalvar.style.display = 'none';
    if (btnExportar) btnExportar.style.display = 'none';
    
    try {
        const token = localStorage.getItem('notadez_token');
        const [componentesRes, gridRes] = await Promise.all([
            fetch(`http://localhost:3333/api/v1/notas/componentes/disciplina/${idDisciplina}`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`http://localhost:3333/api/v1/notas/turma/${idTurma}`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (!componentesRes.ok) throw new Error('Falha ao buscar componentes.');
        if (!gridRes.ok) throw new Error('Falha ao buscar notas.');

        const componentes = await componentesRes.json();
        const gridData = await gridRes.json();

        if (gridData.length === 0) {
            container.innerHTML = `<div class="empty-state"><i class="fas fa-users"></i><h3>Nenhum aluno na turma</h3><p>Inscreva alunos na aba "Alunos" para poder lançar notas.</p></div>`;
            return;
        }

        // Calcula a soma total de pesos para o cálculo inicial
        const totalPesos = componentes.reduce((acc, c) => acc + parseFloat(c.PESO), 0);

        let tableHtml = '<table><thead><tr><th>Aluno</th>';
        componentes.forEach(c => {
            // Mostra o peso no cabeçalho para referência
            tableHtml += `<th>${c.NOME} <br><small style="color:#ccc">(${c.SIGLA} - Peso: ${c.PESO})</small></th>`;
        });
        tableHtml += '<th style="background-color: #eef2f7; color: #2c3e50;">Nota Final</th></tr></thead><tbody>';

        gridData.forEach(aluno => {
            tableHtml += `<tr><td><strong>${aluno.nomeCompleto}</strong><br><small>${aluno.matricula}</small></td>`;
            
            let somaPonderada = 0;

            componentes.forEach(c => {
                const valorRaw = aluno.notas[c.ID_COMPONENTE];
                const valorExibicao = valorRaw !== undefined && valorRaw !== null ? valorRaw : ''; 
                
                // Cálculo inicial (apenas para exibir ao carregar)
                const notaParaCalculo = valorRaw !== undefined && valorRaw !== null ? parseFloat(valorRaw) : 0;
                somaPonderada += (notaParaCalculo * parseFloat(c.PESO));

                // 1. data-peso: Guarda o peso no input
                // 2. oninput: Chama o cálculo a cada tecla digitada
                tableHtml += `
                    <td>
                        <input type="number" class="nota-input" 
                               min="0" max="10" step="0.01" 
                               value="${valorExibicao}"
                               data-id-inscricao="${aluno.idInscricao}"
                               data-id-componente="${c.ID_COMPONENTE}"
                               data-peso="${c.PESO}"
                               oninput="recalcularNotaFinal('${aluno.idInscricao}')"
                               onblur="formatarInputNota(this); recalculaNotaFinal('${aluno.idInscricao}')" 
                               onfocus="this.select()">
                    </td>`;
            });

            // Cálculo inicial
            const notaFinal = totalPesos > 0 ? (somaPonderada / totalPesos).toFixed(1) : '0.00';
            const corNota = parseFloat(notaFinal) >= 6.0 ? 'green' : 'red';

            tableHtml += `<td id="nota-final-${aluno.idInscricao}" style="font-weight:bold; font-size:1.1em; color:${corNota}; background-color: #c8c9caff;">${notaFinal}</td>`;
            tableHtml += '</tr>';
        });
        
        tableHtml += '</tbody></table>';
        container.innerHTML = tableHtml;
        btnSalvar.style.display = 'inline-block';
        btnExportar.style.display = 'inline-block';

    } catch (error) {
        console.error("Erro ao montar grade de notas:", error);
        showToast(error.message, true);
        container.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-circle"></i><h3>Erro ao carregar dados</h3><p>${error.message}</p></div>`;
    }
}

// =======================================================
// ===== LÓGICA DO MODAL DE FÓRMULAS =====
// =======================================================

// Abre o modal de fórmulas e carrega as disciplinas no select.
function abrirModalFormula() {
    const modal = document.getElementById('modalFormula');
    const select = document.getElementById('formulaDisciplinaSelect');
    
    // Preenche o select com as disciplinas que já temos em 'data.disciplinas'
    select.innerHTML = '<option value="">Selecione uma disciplina...</option>';
    data.disciplinas.forEach(disc => {
        const option = document.createElement('option');
        option.value = disc.ID_DISCIPLINA;
        option.textContent = `${disc.NOME} (${disc.CODIGO || ''})`;
        select.appendChild(option);
    });

    // Esconde a área de config e limpa campos
    document.getElementById('areaConfigFormula').style.display = 'none';
    modal.style.display = 'block';
}

// Fecha o modal de fórmulas.
function fecharModalFormula() {
    document.getElementById('modalFormula').style.display = 'none';
}

// Alterna a habilitação do campo de peso com base no tipo de média selecionado.
function togglePesoInput() {
    const tipo = document.querySelector('input[name="tipoMedia"]:checked').value;
    const inputPeso = document.getElementById('compPeso');
    
    if (tipo === 'A') {
        // Aritmética: Valor fixo 1 e desabilitado
        inputPeso.value = '1';
        inputPeso.disabled = true;
    } else {
        // Ponderada: Habilita para usar as setinhas
        inputPeso.value = '0.1'; // Valor inicial sugerido
        inputPeso.disabled = false;
    }
}

// Carrega os componentes de uma disciplina do servidor.
async function carregarComponentesDaDisciplina() {
    const idDisciplina = document.getElementById('formulaDisciplinaSelect').value;
    const areaConfig = document.getElementById('areaConfigFormula');
    const listaUl = document.getElementById('listaComponentesUl');
    const token = localStorage.getItem('notadez_token');

    if (!idDisciplina) {
        areaConfig.style.display = 'none';
        return;
    }
    
    areaConfig.style.display = 'block';
    listaUl.innerHTML = '<li style="padding:10px;">Carregando...</li>';

    try {
        const res = await fetch(`http://localhost:3333/api/v1/notas/componentes/disciplina/${idDisciplina}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const componentes = await res.json();

        listaUl.innerHTML = '';
        if (componentes.length === 0) {
            listaUl.innerHTML = '<li style="padding:10px; color:#777;">Nenhum componente cadastrado.</li>';
        }

        componentes.forEach(c => {
            const li = document.createElement('li');
            li.style.padding = '10px';
            li.style.borderBottom = '1px solid #eee';
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            li.style.alignItems = 'center';
            
            li.innerHTML = `
                <span>
                    <strong>${c.SIGLA}</strong> - ${c.NOME} 
                    <span style="color:#666; font-size:0.85em; margin-left:10px; background:#eee; padding:2px 6px; border-radius:4px;">Peso: ${c.PESO}</span>
                </span>
                <button onclick="deletarComponente(${c.ID_COMPONENTE})" style="background:none; border:none; color:red; cursor:pointer;">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            listaUl.appendChild(li);
        });
    } catch (e) {
        console.error(e);
        listaUl.innerHTML = '<li style="padding:10px; color:red;">Erro ao carregar.</li>';
    }
}

// Adiciona um novo componente de nota.
async function adicionarComponente() {
    const idDisciplina = document.getElementById('formulaDisciplinaSelect').value;
    const nome = document.getElementById('compNome').value;
    const sigla = document.getElementById('compSigla').value;
    // Pega o valor do input
    const peso = parseFloat(document.getElementById('compPeso').value);
    const tipoMedia = document.querySelector('input[name="tipoMedia"]:checked').value;
    
    const token = localStorage.getItem('notadez_token');

    if (!idDisciplina) return showToast("Selecione uma disciplina!", true);
    if (!nome || !sigla) return showToast("Preencha nome e sigla!", true);

    // Validação extra para Ponderada
    if (tipoMedia === 'P') {
        if (isNaN(peso) || peso <= 0 || peso > 1.0) {
            return showToast("O peso deve ser entre 0.1 e 1.0", true);
        }
    }

    try {
        const res = await fetch('http://localhost:3333/api/v1/componentes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ nome, sigla, peso, idDisciplina })
        });

        if (res.ok) {
            showToast("Componente adicionado!");
            document.getElementById('compNome').value = '';
            document.getElementById('compSigla').value = '';
            
            // Reseta o peso para o padrão atual
            if (tipoMedia === 'P') document.getElementById('compPeso').value = '0.1';
            
            carregarComponentesDaDisciplina(); 
        } else {
            const err = await res.json();
            showToast(err.error || "Erro ao criar componente.", true);
        }
    } catch (e) {
        console.error(e);
        showToast("Erro de conexão.", true);
    }
}

// Deleta um componente de nota.
async function deletarComponente(id) {
    if(!confirm("Remover este componente? As notas lançadas nele serão perdidas.")) return;
    const token = localStorage.getItem('notadez_token');
    
    await fetch(`http://localhost:3333/api/v1/componentes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    carregarComponentesDaDisciplina();
}


// =======================================================
// PONTO DE ENTRADA PRINCIPAL 
// =======================================================
// Adiciona um ouvinte de evento que é acionado quando o DOM está totalmente carregado.
document.addEventListener('DOMContentLoaded', () => {

    const docenteString = localStorage.getItem('notadez_docente');
    const token = localStorage.getItem('notadez_token');
    if (!docenteString || !token) {
        window.location.href = 'inicio.html';
        return; 
    }
    const docente = JSON.parse(docenteString);
    document.getElementById('nome-docente-logado').innerText = docente.nome;

    // Inicializa a aplicação, carregando todos os dados necessários.
    async function initializeApp() {
        await Promise.all([
            loadInstituicoes(), 
            loadDisciplinas(),
            loadTodosAlunos(),
            loadAllTurmas()
        ]);
        renderTurmas();
    }
    initializeApp();

    // --- Manipulador de entrada de arquivo CSV ---
    document.getElementById('alunoCsvFile').addEventListener('change', (e) => {
        const span = document.getElementById('nome-arquivo-csv');
        span.textContent = e.target.files.length > 0 ? e.target.files[0].name : 'Nenhum arquivo selecionado';
    });
    
    // --- OUVINTES DE NAVEGAÇÃO E TEMA ---
    const menuLinks = document.querySelectorAll('.menu-link');
    const sections = document.querySelectorAll('.section');
    const pageTitle = document.getElementById('pageTitle');

    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            menuLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(sectionId).classList.add('active');
            pageTitle.textContent = {
                home: 'Dashboard', instituicoes: 'Gerenciar Instituições', turmas: 'Gerenciar Turmas',
                alunos: 'Gerenciar Alunos', disciplinas: 'Gerenciar Disciplinas', notas: 'Gerenciar Notas'
            }[sectionId] || 'NotaDez';
            if (window.innerWidth <= 768) document.getElementById('sidebar').classList.remove('active');
        });
    });

    document.getElementById('menuToggle').addEventListener('click', () => document.getElementById('sidebar').classList.toggle('active'));

    document.getElementById('themeToggle').addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const isLight = document.body.classList.contains('light-theme');
        document.querySelector('#themeToggle i').className = isLight ? 'fas fa-sun' : 'fas fa-moon';
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });

    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-theme');
        document.querySelector('#themeToggle i').className = 'fas fa-sun';
    }
    
    document.getElementById('modalDetalhes').addEventListener('click', (e) => e.target.id === 'modalDetalhes' && closeModal());

    // --- OUVINTES DE FORMULÁRIO (CREATE) ---
    document.getElementById('formInstituicao').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
        try {
            const resposta = await fetch('http://localhost:3333/api/v1/instituicoes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    nome: document.getElementById('instituicaoNome').value,
                    local: document.getElementById('instituicaoLocal').value
                })
            });
            if (!resposta.ok) throw new Error((await resposta.json()).error);
            e.target.reset();
            showToast('Instituição adicionada!');
            loadInstituicoes();
        } catch (erro) {
            showToast(`Erro: ${erro.message}`, true);
        } finally {
            btn.disabled = false; btn.innerHTML = '<i class="fas fa-plus"></i> Adicionar Instituição';
        }
    });
    
    document.getElementById('formTurma').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
        const idInstituicao = document.getElementById('turmaInstituicao').value;
        try {
            const resposta = await fetch('http://localhost:3333/api/v1/turmas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    nome: document.getElementById('turmaNome').value,
                    codigo: document.getElementById('turmaCodigo').value,
                    apelido: document.getElementById('turmaApelido').value,
                    idInstituicao: idInstituicao,
                    idDisciplina: document.getElementById('turmaDisciplina').value
                })
            });
            if (!resposta.ok) throw new Error((await resposta.json()).error);
            e.target.reset();
            showToast('Turma adicionada!');
            loadTurmas(idInstituicao); 
        } catch (erro) {
            showToast(`Erro: ${erro.message}`, true);
        } finally {
            btn.disabled = false; btn.innerHTML = '<i class="fas fa-plus"></i> Adicionar Turma';
        }
    });
    
    document.getElementById('formDisciplina').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
        try {
            const resposta = await fetch('http://localhost:3333/api/v1/disciplinas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    nome: document.getElementById('disciplinaNome').value,
                    sigla: document.getElementById('disciplinaSigla').value,
                    codigo: document.getElementById('disciplinaCodigo').value,
                    periodo_curso: document.getElementById('disciplinaPeriodo').value
                })
            });
            if (!resposta.ok) throw new Error((await resposta.json()).error);
            e.target.reset();
            showToast('Disciplina adicionada!');
            loadDisciplinas();
        } catch (erro) {
            showToast(`Erro: ${erro.message}`, true);
        } finally {
            btn.disabled = false; btn.innerHTML = '<i class="fas fa-plus"></i> Adicionar Disciplina';
        }
    });
    
    document.getElementById('formAluno').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
        const idTurma = document.getElementById('alunoTurma').value;
        try {
            const resposta = await fetch('http://localhost:3333/api/v1/alunos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    nome: document.getElementById('alunoNome').value,
                    matricula: document.getElementById('alunoMatricula').value,
                    idInstituicao: document.getElementById('alunoInstituicao').value,
                    idTurma: idTurma
                })
            });
            if (!resposta.ok) throw new Error((await resposta.json()).error);
            document.getElementById('alunoNome').value = '';
            document.getElementById('alunoMatricula').value = '';
            showToast('Aluno inscrito com sucesso!');
            loadAlunos(idTurma);
            loadTodosAlunos(); // Atualiza a lista mestra
        } catch (erro) {
            showToast(`Erro: ${erro.message}`, true);
        } finally {
            btn.disabled = false; btn.innerHTML = '<i class="fas fa-plus"></i> Adicionar Aluno';
        }
    });

    document.getElementById('formAlunoCsv').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        const msgDiv = document.getElementById('csv-upload-status');
        const fileInput = document.getElementById('alunoCsvFile');
        const idInstituicao = document.getElementById('alunoInstituicao').value;
        const idTurma = document.getElementById('alunoTurma').value;
        
        if (!idInstituicao || !idTurma || !fileInput.files.length) {
            showToast('Selecione Instituição, Turma e um arquivo CSV.', true);
            return;
        }
        
        btn.disabled = true; btn.innerText = 'Importando...';
        msgDiv.innerText = '';
        try {
            const formData = new FormData();
            formData.append('arquivoCsv', fileInput.files[0]);
            const resposta = await fetch(`http://localhost:3333/api/v1/alunos/upload-csv/instituicao/${idInstituicao}/turma/${idTurma}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const resultado = await resposta.json();
            if (!resposta.ok) throw new Error(resultado.error);
            
            showToast(`Importação concluída!`, false);
            msgDiv.innerHTML = `Sucesso: ${resultado.sucesso}. Falhas: ${resultado.falhas}.`;
            msgDiv.style.color = resultado.falhas > 0 ? 'orange' : 'green';
            if (resultado.erros && resultado.erros.length) {
                msgDiv.innerHTML += `<br><small>${resultado.erros.join(', ')}</small>`;
            }
            e.target.reset();
            document.getElementById('nome-arquivo-csv').textContent = 'Nenhum arquivo selecionado';
            loadAlunos(idTurma);
            loadTodosAlunos(); // Atualiza a lista mestra
        } catch (erro) {
            showToast(`Erro: ${erro.message}`, true);
            msgDiv.innerText = `Erro: ${erro.message}`;
            msgDiv.style.color = 'red';
        } finally {
            btn.disabled = false; btn.innerText = 'Importar CSV';
        }
    });

    const btnSalvarNotas = document.getElementById('btnSalvarNotas');
    if (btnSalvarNotas) {
        btnSalvarNotas.addEventListener('click', async () => {
            const inputsAlterados = document.querySelectorAll('.nota-input[data-dirty="true"]');
            if (inputsAlterados.length === 0) {
                showToast("Nenhuma nota foi alterada.", false);
                return;
            }

            btnSalvarNotas.disabled = true; btnSalvarNotas.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
            const notasParaSalvar = Array.from(inputsAlterados).map(input => ({
                idInscricao: parseInt(input.dataset.idInscricao, 10),
                idComponente: parseInt(input.dataset.idComponente, 10),
                valorNota: input.value === '' ? null : parseFloat(input.value)
            }));

            try {
                const resposta = await fetch('http://localhost:3333/api/v1/notas/lote', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ notas: notasParaSalvar })
                });
                if (!resposta.ok) throw new Error((await resposta.json()).error);
                showToast(`${notasParaSalvar.length} nota(s) salva(s) com sucesso!`);
                inputsAlterados.forEach(input => input.dataset.dirty = 'false');
            } catch (error) {
                showToast(`Erro ao salvar notas: ${error.message}`, true);
            } finally {
                btnSalvarNotas.disabled = false; btnSalvarNotas.innerHTML = '<i class="fas fa-save"></i> Salvar Notas Alteradas';
            }
        });
    }

    const btnExportar = document.getElementById('btnExportarCsv');
    if (btnExportar) {
        btnExportar.addEventListener('click', async () => {
            // Pega a turma selecionada no filtro
            const idTurma = document.getElementById('notaTurmaFiltro').value;
            const token = localStorage.getItem('notadez_token');
    
            if (!idTurma) {
                showToast("Selecione uma turma para exportar.", true);
                return;
            }
    
            // Feedback visual (desabilita botão)
            const textoOriginal = btnExportar.innerHTML;
            btnExportar.disabled = true;
            btnExportar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Baixando...';
    
            try {
                // 2. Chama a rota de exportação do backend
                const resposta = await fetch(`http://localhost:3333/api/v1/notas/exportar/turma/${idTurma}`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
    
                if (!resposta.ok) throw new Error("Erro ao gerar o arquivo CSV.");
    
                // 3. Converte a resposta em um "Blob" (arquivo na memória)
                const blob = await resposta.blob();
                
                // 4. Cria um link invisível para forçar o download
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                
                // Gera o nome do arquivo: YYYY-MM-DD_Notas_TurmaX.csv
                const dataHoje = new Date().toISOString().split('T')[0];
                a.download = `${dataHoje}_Notas_Turma_${idTurma}.csv`;
                
                // "Clica" no link e depois o remove
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url); // Limpa a memória
    
                showToast("Download concluído!");
    
            } catch (erro) {
                console.error(erro);
                showToast("Erro ao exportar CSV.", true);
            } finally {
                // Restaura o botão
                btnExportar.disabled = false;
                btnExportar.innerHTML = textoOriginal;
            }
        });
    }

    // --- OUVINTES DE FILTROS E EVENTOS EM CASCATA ---
    
    // Filtros de busca simples
    ['searchInstituicoes', 'searchTurmas', 'searchDisciplinas', 'searchAlunos'].forEach(id => {
        const searchInput = document.getElementById(id);
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const keyMap = {
                searchInstituicoes: { dataKey: 'instituicoes', fields: ['NOME', 'LOCAL'], renderFunc: renderInstituicoes },
                searchTurmas: { dataKey: 'turmas', fields: ['NOME', 'CODIGO'], renderFunc: renderTurmas },
                searchDisciplinas: { dataKey: 'disciplinas', fields: ['NOME', 'CODIGO', 'SIGLA'], renderFunc: renderDisciplinas },
                searchAlunos: { dataKey: 'alunos', fields: ['NOME_COMPLETO', 'MATRICULA'], renderFunc: (d) => renderAlunos(d, false) },
            };
            const config = keyMap[id];
            const filtered = data[config.dataKey].filter(item => config.fields.some(field => item[field] && item[field].toLowerCase().includes(term)));
            config.renderFunc(filtered);
        });
    }
    });

    // Eventos em cascata
    document.getElementById('turmaInstituicao').addEventListener('change', (e) => loadTurmas(e.target.value));
    document.getElementById('alunoInstituicao').addEventListener('change', (e) => {
        // Chama o backend para buscar as turmas da instituição selecionada
        loadTurmas(e.target.value);
    });
    document.getElementById('alunoTurma').addEventListener('change', (e) => loadAlunos(e.target.value));
    
    // Filtros em cascata para NOTAS
    document.getElementById('notaInstituicaoFiltro').addEventListener('change', (e) => {
        document.getElementById('notaDisciplinaFiltro').disabled = !e.target.value;
        document.getElementById('notaTurmaFiltro').disabled = true;
        renderNotasGrid(null, null);
    });
    document.getElementById('notaDisciplinaFiltro').addEventListener('change', (e) => {
        loadTurmas(document.getElementById('notaInstituicaoFiltro').value).then(() => {
            updateTurmaSelects('notaInstituicaoFiltro', 'notaTurmaFiltro', e.target.value);
            renderNotasGrid(null, null);
        });
    });
    document.getElementById('notaTurmaFiltro').addEventListener('change', (e) => {
        renderNotasGrid(e.target.value, document.getElementById('notaDisciplinaFiltro').value);
    });

});
