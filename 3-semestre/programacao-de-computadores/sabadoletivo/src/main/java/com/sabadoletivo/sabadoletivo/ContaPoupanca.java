package com.sabadoletivo.sabadoletivo;

public class ContaPoupanca extends ContaBancaria {
    public ContaPoupanca(int numero, int agencia, double saldo) {
        this.numero = numero;
        this.agencia = agencia;
        this.saldo = saldo;
    }
    
    @Override
    public double calcularTarifaMensal(){
        return 0;
    }
}
