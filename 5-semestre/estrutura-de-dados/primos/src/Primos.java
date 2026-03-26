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
        int divisor = inicio.valor;

        while (divisor <= (N / 2)) {
            No temp = inicio.prox;
            No temp2 = inicio.prox;
            System.out.println("-----");
            System.out.println(temp2.valor);
            exibir();
            while (temp2.prox != null) {

                if (divisor >= temp2.prox.valor) {
                    temp2 = temp2.prox;
                    continue;
                }
                if (temp2.valor % divisor == 0) {
                    tamanho++;

                    System.out.print("valor " + temp2.valor);
                    System.out.print("  divisor " + divisor);
                    System.out.print('\n');
                    exibir();
                    System.out.println(temp.prox.valor);
                    temp.prox = temp.prox.prox;
                    System.out.println(temp.valor);
                    temp = temp.prox;
                    temp2 = temp.prox;
                    exibir();
                    continue;
                }
                temp2 = temp2.prox;
            }
            if (temp.prox == null) {
                break;
            }
            divisor++;
        }

    }


    static public int tamanho() {
        return tamanho;
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