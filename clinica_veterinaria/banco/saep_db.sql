CREATE DATABASE IF NOT EXISTS saep_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE saep_db;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tutores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(140) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  telefone VARCHAR(25) NOT NULL,
  cpf_criptografado TEXT NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  especie VARCHAR(60) NOT NULL,
  raca VARCHAR(100),
  data_nascimento DATE,
  sexo ENUM('Macho','Fêmea') NULL,
  tutor_id INT NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pets_tutores FOREIGN KEY (tutor_id) REFERENCES tutores(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS agendamentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pet_id INT NOT NULL,
  data_hora DATETIME NOT NULL,
  motivo VARCHAR(255) NOT NULL,
  status ENUM('Agendado','Confirmado','Concluído','Cancelado') NOT NULL DEFAULT 'Agendado',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_agendamentos_pets FOREIGN KEY (pet_id) REFERENCES pets(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_agendamentos_data (data_hora)
) ENGINE=InnoDB;

-- Credenciais demonstrativas: admin@vetcare.com / Admin@123
-- Troque a senha e as chaves antes de qualquer uso real.
INSERT INTO usuarios (id,nome,email,senha_hash,ativo) VALUES
(1,'Administrador VetCare','admin@vetcare.com','scrypt$ABEiM0RVZneImaq7zN3u/w==$8DU+ZcETlIbqLOsptqxLJL05FAXebp2WfvGAtoXz49W0bXE5goUum+ECy2GpSo1E5mP87s568+T9R306Ksm14g==',1),
(2,'Mariana Costa','mariana@vetcare.com','scrypt$ECEyQ1RldoeYqbrL3O3+Dw==$A5qhp+qgpYFSfuNd+VdqFnWCg6ZvVMaFcPkk1nDol8g+jXOpl3sLHAy5zNimZzXCx3kbuLynpV9Aq6HBa4cHjg==',1),
(3,'Rafael Lima','rafael@vetcare.com','scrypt$/+7dzLuqmYh3ZlVEMyIRAA==$kVdNXpPJ0sEss2UggqybSw8iEWxqk/xo68hCun8FIsZIuKjNrMnOQ068octgVJaVy+Aqv6ugjxiJs9OVwwCh2A==',1)
ON DUPLICATE KEY UPDATE nome=VALUES(nome);

-- CPF de exemplo criptografado com a chave de demonstração do arquivo .env.example.
INSERT INTO tutores (id,nome,email,telefone,cpf_criptografado) VALUES
(1,'Ana Paula Souza','ana.souza@email.com','(12) 98811-2233','9rm7ar9Fkbk0N7wqradjkUpw42o1pVKf5Zv2pcu/HoFS5mNLp1CW'),
(2,'Carlos Mendes','carlos.mendes@email.com','(12) 97722-3344','uUaADmfg5xxSP5+Jnru2pEXSnCQ6yrugHwuQ2+NjlxP1+NFvI3i3'),
(3,'Juliana Ferreira','juliana.ferreira@email.com','(12) 96633-4455','XODLfnfIxSNOrmIktkx1FIc/TqfvWYdb0qDQMiuCK5tNazBhi31U')
ON DUPLICATE KEY UPDATE nome=VALUES(nome);

INSERT INTO pets (id,nome,especie,raca,data_nascimento,sexo,tutor_id) VALUES
(1,'Luna','Cão','Golden Retriever','2021-05-10','Fêmea',1),
(2,'Mingau','Gato','SRD','2022-08-21','Macho',2),
(3,'Thor','Cão','Labrador','2020-11-02','Macho',3)
ON DUPLICATE KEY UPDATE nome=VALUES(nome);

INSERT INTO agendamentos (id,pet_id,data_hora,motivo,status) VALUES
(1,1,'2026-11-20 09:00:00','Consulta de rotina','Agendado'),
(2,2,'2026-11-20 10:30:00','Vacinação','Confirmado'),
(3,3,'2026-11-21 14:00:00','Avaliação clínica','Agendado')
ON DUPLICATE KEY UPDATE data_hora=VALUES(data_hora);
