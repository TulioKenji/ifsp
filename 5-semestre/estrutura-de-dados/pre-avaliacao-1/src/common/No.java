package common;

public class No {
    public int valor;
    public No prox;
    public No ant;

    public No(int v){
        this.valor = v;
        this.prox = null;
        this.ant = null;
    }
}
