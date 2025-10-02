package com.sabadoletivo.sabadoletivo;

public class ContaUniversitaria extends ContaBancaria{
    public ContaUniversitaria(int numero, int agencia, double saldo) {
        this.numero = numero;
        this.agencia = agencia;
        this.saldo = saldo;
    }
    
    @Override
    public double calcularTarifaMensal(){
        return 5;
    }
    
    @Override
    public void depositar(double valor){
        if((saldo+=valor) > 5000){
            System.out.println("Sem limite para depósito");
        }else{
            saldo+=valor;
        }
    }
}
