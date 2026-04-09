public class Main{
    static void main() {
        var ls = new ListasDuplamenteLigadas();
//        ls.inserirInicio(1);
//        ls.inserirInicio(2);
//        ls.inserirInicio(3);
//        ls.inserirInicio(4);
//        ls.inserirInicio(5);
//        ls.inserirInicio(6);
//        ls.inserirInicio(7);
//        ls.inserirInicio(8);
//        ls.inserirInicio(9);
//        ls.inserirInicio(10);

//        ls.inserirFinal(1);
//        ls.inserirFinal(2);
//        ls.inserirFinal(3);
//        ls.inserirFinal(4);
//        ls.inserirFinal(5);
//        ls.inserirFinal(6);
//        ls.inserirFinal(7);
//        ls.inserirFinal(8);
//        ls.inserirFinal(9);
//        ls.inserirFinal(10);

        ls.inserirOrdenado(5);
        ls.inserirOrdenado(3);
        ls.inserirOrdenado(7);
        ls.inserirOrdenado(2);
        ls.inserirOrdenado(4);
        ls.inserirOrdenado(1);
        ls.inserirOrdenado(10);
        ls.inserirOrdenado(2);
        ls.inserirOrdenado(1);
        ls.inserirOrdenado(10);
        ls.inserirOrdenado(2);

        ls.exibir();
        System.out.println();
        ls.exibirInverso();
    }
}