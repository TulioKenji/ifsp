public class ListasDuplamenteLigadas {
    private No inicio = null;
    private No fim = null;
    void inserirInicio(int x) {
        if (inicio == null) {
            inicio = new No(x);
            return;
        }
        No novo = new No(x);
        if (inicio.prox == null) {
            fim = inicio;
            fim.ant = novo;
            novo.prox = fim;
            inicio = novo;
            return;
        }
        inicio.ant = novo;
        novo.prox = inicio;
        inicio = novo;
    }

    void inserirFinal(int x) {
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
    }

    void inserirOrdenado(int x) {
        if (inicio == null) {
            inicio = new No(x);
            return;
        }
        No novo = new No(x);
        if (inicio.prox == null) {
            if(x >= inicio.valor){
                fim = novo;
                fim.ant = inicio;
                inicio.prox = fim;
                return;
            }
            fim = inicio;
            fim.ant = novo;
            novo.prox = fim;
            inicio = novo;
            return;
        }
        No temp = inicio;
        while (temp.prox != null){
            if(temp.prox.valor > x){
                break;
            }
            temp = temp.prox;
        }
        if(temp == fim|| temp.prox == null){
            fim.prox = novo;
            novo.ant = fim;
            fim = novo;
            return;
        }
        if(temp == inicio){
            inicio.ant = novo;
            novo.prox = inicio;
            inicio = novo;
            return;
        }
        No prox = temp.prox;
        prox.ant = novo;
        temp.prox = novo;
        novo.prox = prox;
        novo.ant = temp;

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
        while (temp.prox != null) {
            System.out.print(temp.valor + " ");
            temp = temp.prox;
        }
        System.out.print(temp.valor + " ");
    }

    void exibirInverso() {
//        class ExibirNo {
//            static No run(No x) {
//                if (x == null) {
//                    return null;
//                }
//                if(x.prox == null){
//                    System.out.print(x.valor + " ");
//                    return null;
//                }
//                run(x.prox);
//                System.out.print(x.valor + " ");
//
//                return null;
//            }
//        }
//        if (inicio == null) {
//            System.out.println("lista vazia");
//            return;
//        }
//        if (inicio.prox == null) {
//            System.out.print(inicio.valor + " ");
//            return;
//        }
//        No temp = inicio;
//        ExibirNo.run(temp);
        if (inicio == null) {
            System.out.println("lista vazia");
            return;
        }
        if (inicio.prox == null) {
            return;
        }
        No temp = fim;
        while (temp.ant != null) {
            System.out.print(temp.valor + " ");
            temp = temp.ant;
        }
        System.out.print(temp.valor + " ");

    }

    void remover(int x) {
    }

    void removerPrimeiro() {
        if(inicio == null){
            return;
        }
        inicio = inicio.prox;
    }

    void removerUltimo() {

    }
}
