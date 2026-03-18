public class Fila {
    private No cabeca; // cabeca é o nó de controle da lista o "início" da implementação anterior
    private No cauda;
    private int tamanho;

    public Fila(){
        this.cabeca = null;
        this.cauda = null;
        this.tamanho = 0;
    }
    
    public void enfileirar(int x){
        No novo = new No(x);
        tamanho++;
        if(cabeca == null){
            cabeca = novo;
            cauda = novo;

            return;
        }
        cauda.prox = novo;
        cauda = novo;
    }
    
    public void desenfileirar(){
        if(cabeca == null){
            return;
        }
        tamanho--;
        cabeca = cabeca.prox;
    }
    
    public int cabeca(){
        return cabeca.valor;
    }
    
    public int cauda(){
        return cauda.valor;
    }
    
    public boolean vazia(){
        if(cabeca == null){
            return true;
        }
        return false;
    }
    
    public int tamanho(){
        return tamanho;
    }
    
    public void exibir(){
        if(cabeca == null)
            System.out.println("Lista Vazia, nada a exibir.");
        else{
            No temp = cabeca;
            while(temp != null){
                System.out.println(temp.valor);
                temp = temp.prox;
            }
        }
    }


}
