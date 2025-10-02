package com.sabadoletivo.sabadoletivo;

public class ContaCorrente extends ContaBancaria{

    public ContaCorrente(int numero, int agencia, double saldo) {
        this.numero = numero;
        this.agencia = agencia;
        this.saldo = saldo;
    }
    
    @Override
    public double calcularTarifaMensal(){
        return 15;
    }
}
