package model;

import exception.SaldoInsuficienteException;

public class ContaCorrente extends Conta{
    public ContaCorrente(int numero, String titular, double saldo) {
        super(numero, titular, saldo);
    }

    @Override
    public void sacar(double valor) throws SaldoInsuficienteException {
        if(valor<=0){
            throw new SaldoInsuficienteException("Valor inválido, saldo deve ser maior que 0");
        }
        if(saldo<valor){
            throw new SaldoInsuficienteException("Saldo insuficiente");
        }
        saldo-=valor;
    }
}
