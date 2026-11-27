CREATE DATABASE IF NOT EXISTS universo_limpeza
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE universo_limpeza;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  perfil ENUM('admin', 'cliente') NOT NULL DEFAULT 'cliente',
  endereco VARCHAR(200),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(60) NOT NULL UNIQUE
);

CREATE TABLE produtos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(20) NOT NULL UNIQUE,
  nome VARCHAR(120) NOT NULL,
  categoria_id INT NOT NULL,
  preco DECIMAL(10, 2) NOT NULL CHECK (preco >= 0),
  estoque_atual INT NOT NULL DEFAULT 0 CHECK (estoque_atual >= 0),
  estoque_minimo INT NOT NULL DEFAULT 5 CHECK (estoque_minimo >= 0),
  rendimento VARCHAR(60),
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_produtos_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON UPDATE CASCADE
);

CREATE TABLE pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NULL,
  canal ENUM('Catálogo Online', 'PDV Balcão') NOT NULL DEFAULT 'Catálogo Online',
  cliente_nome VARCHAR(100) NOT NULL,
  tipo_entrega VARCHAR(50) NOT NULL,
  endereco VARCHAR(200),
  forma_pagamento VARCHAR(60) NOT NULL,
  valor_total DECIMAL(10, 2) NOT NULL CHECK (valor_total >= 0),
  status ENUM('Pendente', 'Separado', 'Entregue', 'Cancelado') NOT NULL DEFAULT 'Pendente',
  is_teste BOOLEAN NOT NULL DEFAULT FALSE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pedidos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE pedido_itens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NOT NULL,
  produto_id INT NOT NULL,
  quantidade INT NOT NULL CHECK (quantidade > 0),
  preco_unitario DECIMAL(10, 2) NOT NULL CHECK (preco_unitario >= 0),
  CONSTRAINT fk_itens_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
  CONSTRAINT fk_itens_produto FOREIGN KEY (produto_id) REFERENCES produtos(id)
);

CREATE TABLE movimentacoes_caixa (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo ENUM('ENTRADA', 'SANGRIA', 'SUPRIMENTO') NOT NULL,
  motivo VARCHAR(160) NOT NULL,
  valor DECIMAL(10, 2) NOT NULL CHECK (valor > 0),
  responsavel_id INT NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_mov_responsavel FOREIGN KEY (responsavel_id) REFERENCES usuarios(id)
);

CREATE TABLE fechamentos_caixa (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo_periodo ENUM('DIARIO', 'SEMANAL', 'GERAL') NOT NULL,
  fundo_troco DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  total_pix DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  total_cartao DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  total_dinheiro DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  total_sangrias DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  saldo_gaveta DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  faturamento_total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  responsavel_id INT NOT NULL,
  encerrado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_fechamento_responsavel FOREIGN KEY (responsavel_id) REFERENCES usuarios(id)
);

CREATE TABLE auditoria_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_nome VARCHAR(100) NOT NULL,
  acao VARCHAR(255) NOT NULL,
  registrado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dados iniciais de categorias e catálogo
INSERT INTO categorias (nome) VALUES
  ('Kits Econômicos'),
  ('Limpeza Geral'),
  ('Lavanderia'),
  ('Desinfetantes'),
  ('Alvejantes'),
  ('Utilidades Domésticas');

INSERT INTO produtos (codigo, nome, categoria_id, preco, estoque_atual, estoque_minimo, rendimento) VALUES
  ('00104', 'Detergente Líquido Neutro 500ml', 2, 2.50, 120, 50, 'Uso diário'),
  ('00215', 'Desinfetante Lavanda 2L', 4, 8.90, 8, 15, 'Perfume prolongado'),
  ('00216', 'Desinfetante Lavanda 5L', 4, 18.90, 25, 10, 'Galão econômico'),
  ('00302', 'Sabão em Pó Multiação 1kg', 3, 14.90, 45, 20, 'Rende 12 lavagens'),
  ('00305', 'Lava Roupas Líquido 3L', 3, 24.90, 18, 10, 'Rende 30 lavagens'),
  ('00523', 'Amaciante de Roupas 5L', 3, 24.90, 18, 5, 'Rende 55 lavagens'),
  ('00488', 'Água Sanitária 1L', 5, 4.20, 4, 10, 'Ação bactericida'),
  ('00612', 'Desengordurante Multiuso 500ml', 2, 6.50, 3, 12, 'Limpeza pesada'),
  ('00701', 'Vassoura de Nylon Reforçada', 6, 24.90, 6, 8, 'Alta durabilidade'),
  ('00702', 'Rodo Plástico Duplo 40cm', 6, 19.90, 14, 6, 'Borracha dupla'),
  ('00901', 'Kit Lavanderia Completa (Lava Roupas 3L + Amaciante 5L)', 1, 46.90, 10, 4, 'Economia de R$ 2,90'),
  ('00902', 'Kit Faxina Pesada (Desinfetante 5L + Água Sanitária + Multiuso)', 1, 27.90, 7, 4, 'Combo completo');
