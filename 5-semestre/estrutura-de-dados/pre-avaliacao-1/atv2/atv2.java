import java.util.*;

public class Atv2 {
    public static No inicio;
    
    public static void main(String[] args) {
      int N = 10;
      for(int i = 1; i<=N; i++){
        inserirFinal(i);
      }
      exibir();
      System.out.println(exibirMeio());
    }
    
    public static void inserirFinal(int x){
        if(inicio == null){
            inicio = new No(x);
            return;
        }
        No novo = new No(x);
        if(inicio.prox == null){
            inicio.ant = novo;
            inicio.prox = novo;
            novo.prox = inicio;
            novo.ant = inicio;
            return;
        }
        No ant = inicio.ant;
        ant.prox = novo;
        novo.ant = ant;
        novo.prox = inicio;
        inicio.ant = novo;
    }
    
    public static void exibir() {
        No temp = inicio;

        while(temp.prox != inicio){
            System.out.print(temp.valor + " ");
            temp = temp.prox;
        }
        System.out.println(temp.valor);
    }
    
    public static int exibirMeio(){
      No tempP = inicio.prox;
        No tempA = inicio.ant;
        
        while((tempP!=tempA) && (tempP.prox != tempA)){
            tempP = tempP.prox;
            tempA = tempA.ant;
        }
        if(tempP == tempA)
            return tempP.valor;
        else
            return (tempP.valor + tempA.valor)/2;
    
    }
}

class No {

    int valor;
    No prox;
    No ant;

    public No(int v){
        this.valor = v;
        this.prox = null;
        this.ant = null;
    }
}
