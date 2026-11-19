# Documentação de software — VetCare

## 1. Objetivo
Desenvolver um sistema web para organizar os cadastros de tutores e pets e o controle de agendamentos de uma clínica veterinária, reduzindo perdas de consultas, duplicidade de informações e exposição indevida de dados pessoais.

## 2. Requisitos funcionais
| ID | Requisito | Descrição |
|---|---|---|
| RF01 | Autenticar usuário | Permitir login por e-mail e senha cadastrados, validar falhas e iniciar sessão com expiração. |
| RF02 | Encerrar sessão | Permitir que o usuário autenticado saia do sistema, invalidando sua sessão. |
| RF03 | Exibir painel principal | Exibir o nome do usuário logado e atalhos para Tutores, Pets e Agendamentos. |
| RF04 | Gerenciar tutores | Cadastrar, listar, editar e excluir tutores, persistindo alterações no banco. |
| RF05 | Buscar tutores | Pesquisar tutores por nome, e-mail ou telefone e atualizar a listagem com os resultados. |
| RF06 | Proteger CPF | Armazenar o CPF criptografado no banco e descriptografá-lo somente no backend para apresentação autorizada. |
| RF07 | Gerenciar pets | Cadastrar pets com nome, espécie e associação obrigatória a um tutor existente. |
| RF08 | Listar agendamentos | Exibir agendamentos ordenados por data, incluindo informações do pet e do tutor. |
| RF09 | Atualizar agendamento | Permitir alterar a data e hora de um agendamento existente e persistir a alteração. |

## 3. Requisitos de infraestrutura
- SGBD: MySQL 8.0 ou superior (confirmar versão instalada).
- Linguagem de programação: JavaScript (Node.js 18 ou superior; frontend HTML5, CSS3 e JavaScript).
- Backend: Node.js com Express.
- Navegador: Chrome, Edge ou Firefox atualizado.
- Ambiente de desenvolvimento: VS Code.

## 4. Regras de negócio e segurança
1. Cada pet deve estar associado a um tutor existente.
2. Agendamentos devem referenciar pets existentes.
3. O CPF deve ser armazenado criptografado com AES-256-GCM.
4. Senhas devem ser armazenadas com hash scrypt e salt, nunca em texto puro.
5. Login inválido deve retornar mensagem de validação sem revelar se e-mail ou senha está incorreto.
6. Sessões devem expirar conforme configuração `SESSION_HOURS` (padrão: 2 horas).
7. As chaves criptográficas e segredos devem permanecer fora do controle de versão.

## 5. Modelo de dados
- usuarios (1..N sessões de autenticação gerenciadas pela aplicação)
- tutores (1:N pets)
- pets (1:N agendamentos)

## 6. Observação de preenchimento
A versão exata do MySQL e do Node.js deve ser conferida no computador em que o sistema será executado (`SELECT VERSION();` e `node --version`) e transcrita no Anexo 1.
