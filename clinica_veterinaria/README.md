# VetCare — Sistema de Gestão Veterinária

Projeto-base completo para a avaliação prática de Desenvolvimento de Sistemas.

## Requisitos
- Node.js 18 ou superior
- MySQL 8 ou compatível
- VS Code (recomendado)

## Instalação
1. Importe `banco/saep_db.sql` no MySQL Workbench ou phpMyAdmin.
2. Entre na pasta `sistema`.
3. Copie `.env.example` para `.env`.
4. Ajuste usuário, senha e porta do MySQL no `.env`.
5. No terminal, execute `npm install`.
6. Execute `npm start`.
7. Acesse `http://localhost:3000`.

## Login demonstrativo
- E-mail: `admin@vetcare.com`
- Senha: `Admin@123`

## Funcionalidades
- Login, validação de credenciais e sessão com expiração.
- Painel com usuário autenticado e contagem de registros.
- Tutores: listagem, busca, cadastro, edição e exclusão.
- CPF criptografado com AES-256-GCM no backend.
- Senhas protegidas com scrypt e salt.
- Pets associados obrigatoriamente a tutores.
- Agendamentos ordenados por data, com dados de tutor e pet, e atualização da data.

## Segurança e observações
- O `.env.example` contém uma chave de demonstração. Gere chaves novas e altere `SESSION_SECRET` antes de qualquer uso real.
- O CPF é descriptografado apenas no backend para exibição a um usuário autenticado. Em produção, restrinja essa visualização por perfil/permissão e registre auditoria.
- Para produção, configure HTTPS, cookies Secure, usuário MySQL com privilégios mínimos, backups, política de retenção e gestão segura dos segredos.
- A tabela de sessões é criada/gerenciada por `express-mysql-session`.
- O script SQL popula três registros em cada tabela.
- A avaliação não especifica versões exatas do SGBD e da linguagem. Registre no Anexo 1 as versões efetivamente instaladas no computador da prova.
