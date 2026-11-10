create database stockmaster;
USE	stockmaster;

create table nivel_acesso(id_nivel_acesso int auto_increment primary key, descricao varchar (50) not null unique);
insert into nivel_acesso(descricao) values ('Administrador'), ('Técnico');
select * from nivel_acesso;

create table usuario(id_usuario int auto_increment primary key,
nome varchar(100) not null,
email varchar(100) not null unique,
login varchar(50) not null unique,
senha_hash varchar(255) not null,
status boolean not null default true,
id_nivel_acesso int not null,

foreign key (id_nivel_acesso)
references nivel_acesso(id_nivel_acesso)
);

insert into usuario (nome, email, login, senha_hash, status, id_nivel_acesso) values ('usuario teste1', 'teste1@email.com','usuario1', 'h4shT3st', true, 2);
select * from usuario;

create table produto(id_produto int auto_increment primary key,
sku varchar(50) not null unique,
codigo_barras varchar(100),
nome varchar(100) not null,
categoria varchar(100) not null,
descricao text,
quantidade_estoque int not null default 0,
valor decimal(10,2)
);

insert into produto (sku, codigo_barras, nome, categoria, descricao, quantidade_estoque, valor) values ('sku001', '789000000001','Fonte de Alimentação','Componentes', 'Produto em teste', 10, 150.00);
select * from produto;	

create table movimentacao(id_movimentacao int auto_increment primary key,
tipo_movimentacao varchar(50) not null,
quantidade int not null,
justificativa varchar(255),
data_movimentacao datetime not null default current_timestamp,
id_produto int not null,
id_usuario int not null,

foreign key (id_produto) references produto(id_produto),
foreign key (id_usuario) references usuario(id_usuario)
);

insert into movimentacao(tipo_movimentacao, quantidade, justificativa, id_produto, id_usuario) values ('entrada', 5, 'Entrada de teste', 1,1);
select * from movimentacao;


create table relatorios(id_relatorio int auto_increment primary key,
data_inicio date not null,
data_fim date not null,
data_geracao datetime not null default current_timestamp,
id_usuario int not null,
foreign key (id_usuario) references usuario(id_usuario)
);

select * from relatorios;

create table recuperacao_senha(id_recuperacao int auto_increment primary key,
token varchar(255) not null,
data_expiracao datetime not null,
utilizado boolean not null default false,
id_usuario int not null,

foreign key (id_usuario) references usuario(id_usuario)
);

select * from recuperacao_senha;

SELECT 
    m.id_movimentacao,
    m.tipo_movimentacao,
    m.quantidade,
    m.justificativa,
    p.nome AS produto,
    u.nome AS usuario
FROM movimentacao m
JOIN produto p ON m.id_produto = p.id_produto
JOIN usuario u ON m.id_usuario = u.id_usuario;

show tables;
desc usuario;
desc produto;
desc movimentacao;
desc relatorios;
desc recuperacao_senha;
desc nivel_acesso;

select database();
