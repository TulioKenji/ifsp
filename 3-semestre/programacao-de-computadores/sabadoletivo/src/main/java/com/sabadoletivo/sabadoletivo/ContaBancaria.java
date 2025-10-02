
package com.sabadoletivo.sabadoletivo;


public abstract class ContaBancaria {
    protected int numero;
    protected int agencia;
    protected double saldo;
    
    public void depositar(double valor){
        saldo+=valor;
    }
    
    public double consultarSaldo(){
        return saldo;
    }
    
    public abstract double calcularTarifaMensal();
    
    public void AplicarTarifa(){
        saldo-=calcularTarifaMensal();
    }
}
