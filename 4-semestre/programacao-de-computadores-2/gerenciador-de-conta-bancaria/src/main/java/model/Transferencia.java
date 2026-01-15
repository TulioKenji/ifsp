package model;

public class Transferencia {
    private int  numeroOrigem;
    private int numeroDestino;
    private double valor;

    //Classe para o spring converter os dados enviados para fazer o metodo de transferencia
    public Transferencia(){};

    public int getNumeroOrigem() {
        return numeroOrigem;
    }

    public void setNumeroOrigem(int numeroOrigem) {
        this.numeroOrigem = numeroOrigem;
    }

    public int getNumeroDestino() {
        return numeroDestino;
    }

    public void setNumeroDestino(int numeroDestino) {
        this.numeroDestino = numeroDestino;
    }

    public double getValor() {
        return valor;
    }

    public void setValor(double valor) {
        this.valor = valor;
    }
}
