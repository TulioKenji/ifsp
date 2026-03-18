public class Atividade_18_03 {

    public static void main(String[] args) {
        Pilha p1 = new Pilha();
        
        p1.empilhar(8);
        p1.empilhar(12);
        p1.empilhar(13);
        p1.empilhar(14);

        System.out.println(p1.topo());
        
        if(!p1.vazia())
            p1.exibir();

        p1.desempilhar();
        p1.desempilhar();

        p1.exibir();
        System.out.println(p1.tamanho());

        System.out.println("--fila--");
        Fila f1 = new Fila();

        f1.enfileirar(0);

        f1.enfileirar(4);

        f1.enfileirar(5);
        f1.enfileirar(6);
        f1.enfileirar(7);
        f1.enfileirar(8);

        if(!f1.vazia())
            f1.exibir();

        f1.desenfileirar();
        f1.desenfileirar();

        System.out.println("--");

        if(!f1.vazia())
            f1.exibir();
        System.out.println("--");
        System.out.println(f1.cabeca());
        System.out.println(f1.cauda());
        System.out.println(f1.tamanho());

    }
    
}
