package com.sabadoletivo.sabadoletivo;

public class Sabadoletivo {

    public static void main(String[] args) {
        ContaCorrente cc = new ContaCorrente(1,123,4555.5);
        cc.AplicarTarifa();
        System.out.println(cc.consultarSaldo());
    }
}
