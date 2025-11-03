 const dados = {
            instituicoes: [
                { id: 1, nome: "Universidade Federal de Campinas" },
                { id: 2, nome: "Instituto Federal de São Paulo" }
            ],
            turmas: [
                {
                    id: 1,
                    nome: "Desenvolvimento Web Full Stack",
                    local: "Sala 201 - Bloco A",
                    instituicaoId: 1,
                    alunos: ["Ana Carolina Silva", "Bruno Santos Oliveira", "Carlos Eduardo Mendes"]
                },
                {
                    id: 2,
                    nome: "Ciência de Dados e IA",
                    local: "Laboratório 103 - Bloco C",
                    instituicaoId: 1,
                    alunos: ["Alessandro Costa Martins", "Bianca Rodrigues Lima"]
                }
            ],
            disciplinas: [
                { id: 1, nome: "Programação Web Front-end", cargaHoraria: 80, area: "Desenvolvimento Web", instituicaoId: 1 },
                { id: 2, nome: "Banco de Dados", cargaHoraria: 60, area: "Infraestrutura", instituicaoId: 1 }
            ],
            alunos: [
                { id: 1, nome: "Ana Carolina", sobrenome: "Silva", instituicaoId: 1 },
                { id: 2, nome: "Bruno Santos", sobrenome: "Oliveira", instituicaoId: 1 }
            ],
            notas: []
        };

        function showPage(pageId) {
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
            
            document.getElementById(pageId).classList.add('active');

            const titles = {
                'home': 'Bem vindo Professor',
                'turmas': 'Turmas',
                'disciplinas': 'Disciplinas',
                'config': 'Configurações',
                'lancar-notas': 'Lançar Notas',
                'cadastrar-instituicao': 'Cadastrar Instituição',
                'cadastrar-turma': 'Cadastrar Turma',
                'cadastrar-disciplina': 'Cadastrar Disciplina',
                'cadastrar-aluno': 'Cadastrar Aluno'
            };
            document.getElementById('pageTitle').textContent = titles[pageId];

            if (pageId === 'turmas') renderTurmas();
            else if (pageId === 'disciplinas') renderDisciplinas();
            else if (pageId === 'lancar-notas') preencherSelectsNotas();
            else if (pageId === 'cadastrar-turma') preencherSelectInstituicoes('turmaInstituicao');
            else if (pageId === 'cadastrar-disciplina') preencherSelectInstituicoes('disciplinaInstituicao');
            else if (pageId === 'cadastrar-aluno') preencherSelectInstituicoes('alunoInstituicao');
        }

        function preencherSelectInstituicoes(selectId) {
            const s = document.getElementById(selectId);
            s.innerHTML = '<option value="">Selecione uma instituição</option>';
            dados.instituicoes.forEach(inst => {
                s.innerHTML += `<option value="${inst.id}">${inst.nome}</option>`;
            });
        }

        function preencherSelectsNotas() {
            preencherSelectInstituicoes('notasInstituicao');
            
            const st = document.getElementById('notasTurma');
            st.innerHTML = '<option value="">Selecione uma turma</option>';
            dados.turmas.forEach(t => {
                st.innerHTML += `<option value="${t.id}">${t.nome}</option>`;
            });

            const sd = document.getElementById('notasDisciplina');
            sd.innerHTML = '<option value="">Selecione uma disciplina</option>';
            dados.disciplinas.forEach(d => {
                sd.innerHTML += `<option value="${d.id}">${d.nome}</option>`;
            });

            const sa = document.getElementById('notasAluno');
            sa.innerHTML = '<option value="">Selecione um aluno</option>';
            dados.alunos.forEach(a => {
                sa.innerHTML += `<option value="${a.id}">${a.nome} ${a.sobrenome}</option>`;
            });
        }

        function cadastrarInstituicao(e) {
            e.preventDefault();
            const nome = document.getElementById('nomeInstituicao').value;
            dados.instituicoes.push({ id: dados.instituicoes.length + 1, nome });
            
            document.getElementById('instituicaoSuccess').innerHTML = 
                '<div class="success-message">✓ Instituição cadastrada com sucesso!</div>';
            document.getElementById('formInstituicao').reset();
            
            setTimeout(() => {
                document.getElementById('instituicaoSuccess').innerHTML = '';
            }, 3000);
        }

        function cadastrarTurma(e) {
            e.preventDefault();
            const nome = document.getElementById('nomeTurma').value;
            const local = document.getElementById('localTurma').value;
            const instituicaoId = parseInt(document.getElementById('turmaInstituicao').value);
            
            dados.turmas.push({
                id: dados.turmas.length + 1,
                nome,
                local,
                instituicaoId,
                alunos: []
            });
            
            document.getElementById('turmaSuccess').innerHTML = 
                '<div class="success-message">✓ Turma cadastrada com sucesso!</div>';
            document.getElementById('formTurma').reset();
            
            setTimeout(() => {
                document.getElementById('turmaSuccess').innerHTML = '';
            }, 3000);
        }

        function cadastrarDisciplina(e) {
            e.preventDefault();
            const nome = document.getElementById('nomeDisciplina').value;
            const cargaHoraria = parseInt(document.getElementById('cargaHoraria').value);
            const area = document.getElementById('areaDisciplina').value;
            const instituicaoId = parseInt(document.getElementById('disciplinaInstituicao').value);
            
            dados.disciplinas.push({
                id: dados.disciplinas.length + 1,
                nome,
                cargaHoraria,
                area,
                instituicaoId
            });
            
            document.getElementById('disciplinaSuccess').innerHTML = 
                '<div class="success-message">✓ Disciplina cadastrada com sucesso!</div>';
            document.getElementById('formDisciplina').reset();
            
            setTimeout(() => {
                document.getElementById('disciplinaSuccess').innerHTML = '';
            }, 3000);
        }

        function cadastrarAluno(e) {
            e.preventDefault();
            const nome = document.getElementById('nomeAluno').value;
            const sobrenome = document.getElementById('sobrenomeAluno').value;
            const instituicaoId = parseInt(document.getElementById('alunoInstituicao').value);
            
            dados.alunos.push({
                id: dados.alunos.length + 1,
                nome,
                sobrenome,
                instituicaoId
            });
            
            document.getElementById('alunoSuccess').innerHTML = 
                '<div class="success-message">✓ Aluno cadastrado com sucesso!</div>';
            document.getElementById('formAluno').reset();
            
            setTimeout(() => {
                document.getElementById('alunoSuccess').innerHTML = '';
            }, 3000);
        }

        function lancarNotas(e) {
            e.preventDefault();
            const nota = {
                instituicaoId: parseInt(document.getElementById('notasInstituicao').value),
                turmaId: parseInt(document.getElementById('notasTurma').value),
                disciplinaId: parseInt(document.getElementById('notasDisciplina').value),
                alunoId: parseInt(document.getElementById('notasAluno').value),
                av1: parseFloat(document.getElementById('av1').value),
                av2: parseFloat(document.getElementById('av2').value),
                av3: parseFloat(document.getElementById('av3').value),
                av4: parseFloat(document.getElementById('av4').value)
            };
            dados.notas.push(nota);
            
            document.getElementById('notasSuccess').innerHTML = 
                '<div class="success-message">✓ Notas lançadas com sucesso!</div>';
            document.getElementById('formNotas').reset();
            
            setTimeout(() => {
                document.getElementById('notasSuccess').innerHTML = '';
            }, 3000);
        }

        function renderTurmas() {
            const c = document.getElementById('turmasContainer');
            c.innerHTML = '';

            dados.turmas.forEach(t => {
                const card = document.createElement('div');
                card.className = 'turma-card';
                
                let alunosHTML = '';
                t.alunos.forEach(a => {
                    alunosHTML += `<div class="aluno-item">📌 ${a}</div>`;
                });

                const inst = dados.instituicoes.find(i => i.id === t.instituicaoId);

                card.innerHTML = `
                    <div class="turma-header">
                        <div>
                            <div class="turma-title">${t.nome}</div>
                            <div class="turma-local">📍 ${t.local}</div>
                            <div class="turma-local">🏛️ ${inst ? inst.nome : 'N/A'}</div>
                        </div>
                        <div class="turma-badge">${t.alunos.length} alunos</div>
                    </div>
                    <div class="alunos-list">
                        <div class="alunos-title">👨‍🎓 Lista de Alunos</div>
                        ${alunosHTML || '<div class="aluno-item">Nenhum aluno cadastrado</div>'}
                    </div>
                `;
                
                c.appendChild(card);
            });
        }

        function renderDisciplinas() {
            const c = document.getElementById('disciplinasContainer');
            c.innerHTML = '';

            dados.disciplinas.forEach(d => {
                const card = document.createElement('div');
                card.className = 'disciplina-card';
                
                const inst = dados.instituicoes.find(i => i.id === d.instituicaoId);

                card.innerHTML = `
                    <div class="turma-title">${d.nome}</div>
                    <div class="disciplina-info">
                        <div class="info-item">
                            <div class="info-label">⏱️ Carga Horária</div>
                            <div class="info-value">${d.cargaHoraria} horas</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">🎯 Área</div>
                            <div class="info-value">${d.area}</div>
                        </div>
                    </div>
                    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ecf0f1;">
                        <div class="info-label">🏛️ Instituição</div>
                        <div style="margin-top: 8px; color: #34495e; font-weight: 600;">${inst ? inst.nome : 'N/A'}</div>
                    </div>
                `;
                
                c.appendChild(card);
            });
        }