CREATE DATABASE IF NOT EXISTS conta_digital;
USE conta_digital;
CREATE TABLE conta(
    numero  INT             PRIMARY KEY,
    titular VARCHAR(100)    NOT NULL,
    saldo   DECIMAL(10,2)   NOT NULL
);