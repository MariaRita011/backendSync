-- nome do banco
CREATE DATABASE backendsync;

-- acesso
\c backendsync;

-- Criação das tabelas necessarias

-- Criação da tabela categorias ( tipo de produto )
CREATE TABLE categorias (
    id INT PRIMARY KEY,
    nome VARCHAR(255)
);

-- Criação da tabela ambientes ( produto )
CREATE TABLE ambientes (
    nome VARCHAR(255) NOT NULL,
    numero_ambiente INT PRIMARY KEY,
    caminho_imagem TEXT,
    chave BOOLEAN,
    capacidadeAlunos INT,
    tipodoambiente VARCHAR(255),
    ar_condicionado BOOLEAN,
    ventilador BOOLEAN,
    wifi BOOLEAN,
    projetor BOOLEAN,
    chave_eletronica BOOLEAN,
    maquinas INT,
    disponivel BOOLEAN,
    categoria INT REFERENCES categorias(id)
);

-- Criação de tabela usuarios ( clientes )
CREATE TABLE usuarios (
    nif VARCHAR(255) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    caminho_imagem TEXT,
    descriptor TEXT,
    notificacao BOOLEAN,
    notiwhere VARCHAR(100),
    telefone VARCHAR(255),
    email VARCHAR(255),
    adm BOOLEAN
);

-- Criação de tabela salas_fixas
CREATE TABLE salas_fixas (
    id SERIAL PRIMARY KEY,
    ambiente_id INT REFERENCES ambientes(numero_ambiente),
    usuario_id VARCHAR(255) REFERENCES usuarios(nif)
);

-- Criação de tabela chaves ( requesito )
CREATE TABLE chaves (
    id INT PRIMARY KEY,
    disponivel BOOLEAN,
    salas INT REFERENCES ambientes(numero_ambiente)
);

-- Criação da tabela historico
CREATE TABLE historico (
    id SERIAL PRIMARY KEY,
    data_inicio DATE,
    data_fim DATE DEFAULT NULL,
    deleted BOOLEAN,
    funcionario VARCHAR(255) REFERENCES usuarios(nif),
    ambiente INT REFERENCES ambientes(numero_ambiente)
);
