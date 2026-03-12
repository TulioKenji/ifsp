package listaligadasimples;

public class ListaLigadaSimples {
    static No inicio = null;

    public static void main(String[] args) {
        for (int i = 0; i < 10; i++) {

            int x = (int) (Math.random()*30);
            System.out.println("Inserindo: "+x);

            inserirOrdenado(x);
        }

        exibir();
//        removerUltimo();
//        System.out.println("---");
//        exibir();
//        System.out.println("---");
//        removerUltimoComRecursao(inicio);
//        exibir();
    }

    public static void inserir(int x){
        No novo = new No(x);

        if(inicio == null)
            inicio = novo;
        else{
            No temp = inicio;
            while(temp.prox != null) //navegação até o final da lista
                temp = temp.prox;
            //aqui temp está no último nó da lista
            temp.prox = novo;
        }
    }

    public static void exibir(){
        if(inicio == null)
            System.out.println("Lista Vazia, nada a exibir.");
        else{
            No temp = inicio;
            while(temp != null){
                System.out.println(temp.valor);
                temp = temp.prox;
            }
        }
    }

    public static void inserirOrdenado(int x){
        if(inicio == null){
            inicio = new No(x);
            return;
        }
        if(inicio.prox == null){
            if(inicio.valor > x){
                var temp = inicio.valor;
                inicio.valor = x;
                inicio.prox = new No(temp);
                return;
            }
            inicio.prox = new No(x);
            return;
        }
        No temp = inicio;
        while(temp.prox != null){
            if(temp.valor < x){
                temp = temp.prox;
                continue;
            }
            No y = temp.prox;
            No next = new No(temp.valor);
            next.prox = y;
            temp.valor = x;
            temp.prox = next;
            return;
        }
    }

    public static void removerUltimo(){

        if(inicio == null){
            return;
        }
        if(inicio.prox == null){
            inicio = null;
            return;
        }
        No temp = inicio;

        while(temp.prox.prox != null){
            temp = temp.prox;
        }
        System.out.println("removendo "+ temp.prox.valor);
        temp.prox = null;

    }

    public static void removerUltimoComRecursao(No x){
        if(x == null){
            return;
        }
        if(x.prox == null){
            x = null;
            return;
        }
        if(x.prox.prox == null){
            System.out.println("removendo " + x.prox.valor);
            x.prox = null;
            return;
        }
        removerUltimoComRecursao(x.prox);
    }
}
