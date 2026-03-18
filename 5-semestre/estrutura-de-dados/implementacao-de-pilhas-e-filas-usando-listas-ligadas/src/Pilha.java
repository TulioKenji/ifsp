public class Pilha {
    private No topo; // topo é o nó de controle da lista o "início" da implementação anterior
    private No ultimo;
    private int tamanho;
    
    public Pilha(){
        this.topo = null;
        this.ultimo = null;
        this.tamanho = 0;
    }
    
    public void empilhar(int x){
        No novo = new No(x);
        tamanho++;
        if(topo == null){
            topo = novo;
            ultimo = novo;

            return;
        }
        ultimo.prox = novo;
        ultimo = novo;
    }
    
    public void desempilhar(){
        if(topo == null){
            return;
        }
        tamanho--;
        if(topo.prox == null){

            topo = null;
            return;
        }
        No temp = topo.prox;
        while(temp.prox.prox != null){
            temp = temp.prox;
        }
        temp.prox = null;
        ultimo = temp;
    }
    
    public int topo(){
        return topo.valor;
    }
    
    public boolean vazia(){
        if(topo != null){
            return false;
        }
        return true;
    }
    
    public int tamanho(){
        return tamanho;
    }
    
    public void exibir(){
        if(topo == null)
            System.out.println("Lista Vazia, nada a exibir.");
        else{
            No temp = topo;
            while(temp != null){
                System.out.println(temp.valor);
                temp = temp.prox;
            }
        }
    }
    
}
