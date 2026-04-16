package atv1;

public class Main {
    static void main() {
        int N = 13, S = 5, J = 10;
        LDLC ldlc = new LDLC();
        for (int i = 1; i <= N; i++) {
            ldlc.inserirFinal(i);
        }
        ldlc.exibir();

        int position = 0;
        boolean prox = true;
        while (ldlc.length() > 1) {
//            if(prox){
//                ldlc.removerPorPosicao(position+S);
//                prox= false;
//                return;
//            }
//            ldlc.removerPorPosicao(position-J);
//            prox = true;
            position += S;
            System.out.print(position + " - ");
            ldlc.removerPorPosicao(position);

            ldlc.exibir();
        }
    }
}
