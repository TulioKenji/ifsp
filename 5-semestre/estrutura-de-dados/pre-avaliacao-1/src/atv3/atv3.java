import java.util.*;

public class Atv3 {
    public static No inicio;
    
    public static void main(String[] args) {
      int N = 11;
      for(int i = 1; i<=N; i++){
        inserirFinal(i);
      }
      exibir();
      comecoEFim();
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
    
    public static void comecoEFim(){
      No tempA = inicio.ant;
      No tempP = inicio;
      while(tempA.ant != tempP){
        if(tempA.valor == tempP.valor){
          System.out.print(tempA.valor + " ");
          return;
        }
        System.out.print(tempA.valor + " " + tempP.valor + "\n");
        tempA = tempA.ant;
        tempP = tempP.prox;
      }
      System.out.print(tempA.valor + " " + tempP.valor + "\n");
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
