package model;

import exception.SaldoInsuficienteException;


public abstract class Conta {
    int numero;
    String titular;
    double saldo;

    //Construtor que o spring (via Jackson) usa para criar o objeto conta a partir de um JSON
    public Conta(){}

    public Conta(int numero, String titular, double saldo) {
        this.numero = numero;
        this.titular = titular;
        this.saldo = saldo;
    }

    public abstract void sacar(double valor) throws SaldoInsuficienteException;
    public void depositar(double valor){
        if(valor<=0){
            System.out.println("Valor inválido, deve ser maior que 0");
            return;
        }
        this.saldo+=valor;
    };
    public void imprimirDados(){
        System.out.println("Número: "+numero);
        System.out.println("Titular: " + this.titular);
        System.out.println("Saldo: " + this.saldo);
    }

    public int getNumero() {
        return numero;
    }

    public void setNumero(int numero) {
        this.numero = numero;
    }

    public String getTitular() {
        return titular;
    }

    public void setTitular(String titular) {
        this.titular = titular;
    }

    public double getSaldo() {
        return saldo;
    }

    public void setSaldo(double saldo) {
        this.saldo = saldo;
    }
}
