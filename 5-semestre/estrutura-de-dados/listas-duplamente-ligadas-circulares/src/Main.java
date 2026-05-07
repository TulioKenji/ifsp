public class Main {
    static void main() {
//        ListasDuplamenteLigadasCirculares lista = new ListasDuplamenteLigadasCirculares();
//        lista.inserirInicio(1);
//        lista.inserirInicio(2);
//        lista.inserirInicio(3);
//        lista.inserirInicio(4);
//        lista.inserirInicio(5);
//        lista.exibir();
//        System.out.println();
//        ListasDuplamenteLigadasCirculares lista2 = new ListasDuplamenteLigadasCirculares();
//        lista2.inserirFinal(1);
//        lista2.inserirFinal(2);
//        lista2.inserirFinal(3);
//        lista2.inserirFinal(4);
//        lista2.inserirFinal(5);
//        lista2.exibir();
//
//        System.out.println();

        ListasDuplamenteLigadasCirculares lista3 = new ListasDuplamenteLigadasCirculares();
        lista3.inserirOrdenado(3);
        lista3.inserirOrdenado(4);
        lista3.inserirOrdenado(2);
        lista3.inserirOrdenado(6);
        lista3.inserirOrdenado(7);
        lista3.inserirOrdenado(1);
        lista3.inserirOrdenado(9);
        lista3.inserirOrdenado(5);
        lista3.inserirOrdenado(11);
        lista3.inserirOrdenado(12);
        lista3.exibir();
        lista3.exibirInverso();
        lista3.remover(1);
        lista3.remover(12);
        lista3.removerInicio();
        lista3.removerFinal();
        lista3.exibir();
    }
}
