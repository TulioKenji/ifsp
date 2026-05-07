import java.util.Scanner;

public class Primos {

    static No inicio = null; // <- VARIÁVEL GLOBAL
    static No fim = null;
    static int tamanho = 0;

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        System.out.print("Informe o valor de N: ");
        int N = sc.nextInt();

        for (int i = 0; i <= N; i++) {
            inserir(i);
        }
        primos(N);

        exibir();
        System.out.println("\nExistem " + tamanho() + " numeros primos entre 0 e " + N);
    }

    static public void inserir(int x) {
        No novo = new No(x);
        if (inicio == null) {
            inicio = novo;
            fim = novo;

            return;
        }
        fim.prox = novo;
        fim = novo;
    }

    static public void primos(int N) {
        if (inicio == null) {
            return;
        }
        while (inicio.prox.valor < 3) {
            inicio = inicio.prox;
        }
        No temp1 = inicio;

        while(temp1 != null && temp1.valor <= (N/2) ){

            No temp2 = temp1;

            while(temp2.prox != null){

                if((temp2.prox.valor % temp1.valor)==0)
                    temp2.prox = temp2.prox.prox;

                if(temp2.prox != null)
                    temp2 = temp2.prox;
            }

            temp1 = temp1.prox;
        }

    }


    static public int tamanho() {
        int cont = 0;
        No temp = inicio;
        while (temp != null) {
            cont++;
            temp = temp.prox;
        }
        return cont;
    }

    static public void exibir() {
        if (inicio == null)
            System.out.println("Lista Vazia, nada a exibir.");
        else {
            No temp = inicio;
            while (temp != null) {
                System.out.print(temp.valor + " ");
                temp = temp.prox;
            }
            System.out.print('\n');
        }
    }

}