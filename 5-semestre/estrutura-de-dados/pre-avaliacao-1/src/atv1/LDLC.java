package atv1;
import common.No;

public class LDLC {
    private No inicio = null;
    private No fim = null;
    private int length = 0;

    void inserirFinal(int x) {
        length++;
        if (inicio == null) {
            inicio = new No(x);
            return;
        }
        No novo = new No(x);
        if (inicio.prox == null) {
            fim = novo;
            fim.ant = inicio;
            inicio.prox = fim;
            return;
        }
        fim.prox = novo;
        novo.ant = fim;
        fim = novo;
        fim.prox = inicio;
        inicio.ant = fim;
    }

    void removerPorPosicao(int posicao){
        if(inicio == null){
            return;
        }
        length--;
        if(length+1 < 2){
            inicio = null;
            fim = null;
            return;
        }
        if(length+1 < 3){
            inicio.prox = null;
            inicio.ant = null;
            fim = null;
            return;
        }
        No temp = inicio;
        for(int i = 0; i<posicao; i++){
            temp = temp.prox;
        }
        No ant = temp.ant;
        No prox = temp.prox;
        if(temp.prox == inicio){
            ant.prox = inicio;
            inicio.ant = ant;
            fim = ant;
            return;
        }
        if(temp.ant == fim){
            prox.ant = fim;
            fim.prox = prox;
            inicio = prox;
            return;
        }
        ant.prox = prox;
        prox.ant = ant;
    }

    void exibir() {
        if (inicio == null) {
            System.out.println("lista vazia");
            return;
        }
        System.out.print(inicio.valor + " ");
        if (inicio.prox == null) {
            return;
        }
        No temp = inicio.prox;
        while (temp.prox != inicio) {
            System.out.print(temp.valor + " ");
            temp = temp.prox;
        }
        System.out.print(temp.valor + " \n");
    }

    int length(){
        return this.length;
    }
}
