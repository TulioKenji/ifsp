create database if not exists atividade4sop;

use atividade4sop;

create table if not exists usuarios(
	id int primary key auto_increment,
    nome varchar(200),
    email varchar(200),
    senha varchar(200)
);

create table if not exists enderecos(
	id int primary key auto_increment,
    rua varchar(200),
    bairro varchar(200),
    idUsuario int not null,
    foreign key (idUsuario) references usuarios(id) on update cascade on delete no action
);

create table if not exists documentos(
	id int primary key auto_increment,
	cpf varchar(200),
    rg varchar(200),
    cnh varchar(200),
    idUsuario int not null,
    foreign key (idUsuario) references usuarios(id) on update cascade on delete no action
); 