public class FilaCircular {
    private No cabeca; // cabeca é o nó de controle da lista o "início" da implementação anterior
    private No cauda;
    private int tamanho;

    public FilaCircular() {
        this.cabeca = null;
        this.cauda = null;
        this.tamanho = 0;
    }

    public FilaCircular(int[] x) {
        this.tamanho = 0;
        for (int i = 0; i < x.length; i++) {
            insereFinal(x[i]);
        }
    }

    public void insereInicio(int x) {
        No novo = new No(x);
        tamanho++;
        if (cabeca == null) {
            cabeca = novo;
            return;
        }
        if (cabeca.prox == null) {
            cauda = cabeca;
            novo.prox = cauda;
            cabeca = novo;
            cauda.prox = cabeca;
            return;
        }
        cauda.prox = novo;
        novo.prox = cabeca;
        cabeca = novo;
    }

    public void insereFinal(int x) {
        No novo = new No(x);
        tamanho++;
        if (cabeca == null) {
            cabeca = novo;
            return;
        }
        if (cabeca.prox == null) {
            novo.prox = cabeca;
            cauda = novo;
            cabeca.prox = cauda;
            return;
        }
        novo.prox = cabeca;
        cauda.prox = novo;
        cauda = novo;
    }

    public void removeInicio() {
        if (cabeca == null) {
            return;
        }
        ;
        tamanho--;
        if (tamanho < 2) {
            cabeca = null;
            return;
        }
        cabeca = cabeca.prox;
        cauda.prox = cabeca;
    }

    public void removeFinal() {
        if (cabeca == null) {
            return;
        }
        ;
        tamanho--;
        if (tamanho < 2) {
            cabeca = null;
            return;
        }
        No temp = cabeca;
        while (temp.prox.prox != cabeca) {
            temp = temp.prox;
        }
        cauda = temp;
        cauda.prox = cabeca;
    }

    public void josephus(int salto) {
        while (cabeca != cabeca.prox) {
            for (int i = 1; i < salto - 1; i++)
                cabeca = cabeca.prox;
            cabeca.prox = cabeca.prox.prox;
            cabeca = cabeca.prox;
        }
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
            while(temp.prox != cabeca){
                System.out.print(temp.valor + " ");
                temp = temp.prox;
            }
            System.out.println(temp.valor);
        }
        System.out.println("--");
    }


}
