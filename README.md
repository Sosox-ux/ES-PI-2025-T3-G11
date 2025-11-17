# NotaDez - Sistema de Gestão de Notas para Docentes

**Projeto Integrador II - Engenharia de Software (PUC-Campinas) - 2025**

---

## 🎯 Sobre o Projeto

[cite_start]O **NotaDez** é uma ferramenta web desenvolvida para atender à necessidade de docentes do ensino superior de possuir uma ferramenta particular para gerenciar as notas de seus estudantes[cite: 32].

[cite_start]Diferente dos sistemas acadêmicos institucionais (que focam na instituição) ou planilhas genéricas (que carecem de integração e especificidade)[cite: 35], o NotaDez foca na **propriedade intelectual do docente** sobre seus registros acadêmicos. [cite_start]O sistema permite cadastrar instituições, disciplinas e turmas, importar alunos e realizar o cálculo automático de notas finais (aritmética ou ponderada) de maneira ágil e segura[cite: 36, 38].

### Principais Funcionalidades
* [cite_start]**Gestão Completa:** Cadastro de Instituições, Disciplinas e Turmas[cite: 36].
* [cite_start]**Alunos:** Cadastro manual ou importação em massa via arquivo CSV[cite: 37].
* **Notas:** Criação flexível de componentes de avaliação (P1, P2, Trabalhos) e lançamento de notas em grade.
* **Cálculo Automático:** Suporte para médias Aritmética e Ponderada.
* **Exportação:** Geração de relatórios de notas em CSV.

---

## 👥 Equipe de Desenvolvimento

Este projeto foi concebido e desenvolvido pelos seguintes integrantes do **Time G11**:

* **Carlos Eduardo Marins Fonseca** - RA: 25020992
* **Maria Clara Chede Pucci** - RA: 25022698
* **Sophia Victória Martins Fernandes** - RA: 25020335

---

## 💻 Tecnologias Utilizadas

[cite_start]O projeto foi construído atendendo aos requisitos de ambiente estipulados[cite: 190]:

* **Front-End:** HTML5, CSS3, JavaScript (Vanilla).
* [cite_start]**Back-End:** Node.js (LTS), TypeScript[cite: 191].
* [cite_start]**Banco de Dados:** Oracle Database[cite: 194].
* **Bibliotecas Chave:** Express (Servidor), Multer (Uploads), CSV-Parser (Importação), Nodemailer (Envio de E-mail).

---

## 🚀 Como Rodar o Projeto (Ambiente de Testes)

Siga este guia passo a passo para baixar, configurar e executar o projeto em sua máquina local.

### 1. Pré-requisitos
Certifique-se de ter instalado:
* **Node.js** (Versão LTS v18 ou superior).
* **Oracle Database** (Instalado localmente ou acesso a uma instância na nuvem).
* **Git**.

### 2. Clonar e Instalar
Abra o terminal e execute os comandos:

```bash
# 1. Clone este repositório
git clone [https://github.com/SEU-USUARIO/PI_II_ES_TIME_G11.git](https://github.com/SEU-USUARIO/PI_II_ES_TIME_G11.git)

# 2. Entre na pasta do projeto
cd PI_II_ES_TIME_G11

# 3. Instale todas as dependências do Node.js
npm install
````

### 3\. Configuração do Banco de Dados (Oracle)

Você precisa criar a estrutura do banco de dados antes de rodar o sistema.

1.  Conecte-se ao seu banco Oracle (usando SQL Developer, DBeaver ou SQLPlus).
2.  Execute o script SQL fornecido no arquivo `config/script.sql` (ou o script completo de criação das tabelas `DOCENTE`, `ALUNO`, `TURMA`, etc., e as Triggers de auditoria).

