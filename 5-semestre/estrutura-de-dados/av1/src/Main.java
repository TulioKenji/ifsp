import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;

public class Main {
    static int N = 5000;
    public static void main() {
        adicionarCSV("algoritimo;tamanho;aleatorio;melhorcaso;piorcaso");

        BubbleSort bs = new BubbleSort();
        SelectionSort ss = new SelectionSort();
        InsertionSort is = new InsertionSort();
        MergeSort ms = new MergeSort();
        HeapSort hs = new HeapSort();
        CoutingSort cs = new CoutingSort();
        QuickSort qs = new QuickSort();

        adicionarCSV(ordenar(bs));
        adicionarCSV(ordenar(ss));
        adicionarCSV(ordenar(is));
        adicionarCSV(ordenar(ms));
        adicionarCSV(ordenar(hs));
        adicionarCSV(ordenar(cs));
        adicionarCSV(ordenar(qs));

        N = 10000;
        adicionarCSV("algoritimo;tamanho;aleatorio;melhorcaso;piorcaso");
        adicionarCSV(ordenar(bs));
        adicionarCSV(ordenar(ss));
        adicionarCSV(ordenar(is));
        adicionarCSV(ordenar(ms));
        adicionarCSV(ordenar(hs));
        adicionarCSV(ordenar(cs));
        adicionarCSV(ordenar(qs));

        N = 30000;
        adicionarCSV("algoritimo;tamanho;aleatorio;melhorcaso;piorcaso");
        adicionarCSV(ordenar(bs));
        adicionarCSV(ordenar(ss));
        adicionarCSV(ordenar(is));
        adicionarCSV(ordenar(ms));
        adicionarCSV(ordenar(hs));
        adicionarCSV(ordenar(cs));
        adicionarCSV(ordenar(qs));

        N = 50000;
        adicionarCSV("algoritimo;tamanho;aleatorio;melhorcaso;piorcaso");
        adicionarCSV(ordenar(bs));
        adicionarCSV(ordenar(ss));
        adicionarCSV(ordenar(is));
        adicionarCSV(ordenar(ms));
        adicionarCSV(ordenar(hs));
        adicionarCSV(ordenar(cs));
        adicionarCSV(ordenar(qs));
    }

    public static void inicializarVetor(int[] vet, int N, int s) {
        switch(s){
            case 0:
                for (int i = 0; i < N; i++) {
                    vet[i] = (int) (Math.random() * (N * 2));
                }
                break;

            case 1:
                for (int i = 0; i < N; i++)
                    vet[i] = i+1;
                break;
            case 2:
                for (int i = 0; i < N; i++)
                    vet[i] = N-i;
                break;
        }
    }

    public static String ordenar(Ordenar algoritimo) {
        int vetAleatorio[] = new int[N];
        int vetMelhorCaso[] = new int[N];
        int vetPiorCaso[] = new int[N];

        inicializarVetor(vetAleatorio, N, 0);
        inicializarVetor(vetMelhorCaso, N, 1);
        inicializarVetor(vetPiorCaso, N, 2);

        long begin1 = System.currentTimeMillis();
        algoritimo.ordenar(vetAleatorio, N-1);
        long end1 = System.currentTimeMillis();
        String time1 = String.valueOf((end1-begin1));

        long begin2 = System.currentTimeMillis();
        algoritimo.ordenar(vetMelhorCaso, N-1);
        long end2 = System.currentTimeMillis();
        String time2 = String.valueOf((end2-begin2));

        long begin3 = System.currentTimeMillis();
        algoritimo.ordenar(vetPiorCaso, N-1);
        long end3 = System.currentTimeMillis();
        String time3 = String.valueOf((end3-begin3));



        return algoritimo.nome()+";"+ N +";"+time1+";"+time2+";"+time3;
    }

    public static void adicionarCSV(String dados){
        try (FileWriter fw = new FileWriter("dados.csv", true);
             PrintWriter pw = new PrintWriter(fw)) {

            pw.println(dados);

        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
