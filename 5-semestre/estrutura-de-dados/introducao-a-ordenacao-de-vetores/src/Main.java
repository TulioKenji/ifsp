import java.util.Arrays;
import java.util.stream.Stream;

public class Main {

    public static void main(String[] args) {

        int N = 50000;

        int vetAleatorio_1[] = new int[N];
        int vetMelhorCaso_1[] = new int[N];
        int vetPiorCaso_1[] = new int[N];


        inicializarVetor(vetAleatorio_1, N, 0); //0-aleatório, 1-crescente, 2-decrescente
        inicializarVetor(vetMelhorCaso_1, N, 1); //0-aleatório, 1-crescente, 2-decrescente
        inicializarVetor(vetPiorCaso_1, N, 2); //0-aleatório, 1-crescente, 2-decrescente

        int vetAleatorio_2[] = vetAleatorio_1.clone();
        int vetMelhorCaso_2[] = vetMelhorCaso_1.clone();
        int vetPiorCaso_2[] = vetPiorCaso_1.clone();

        int vetAleatorio_3[] = vetAleatorio_1.clone();
        int vetMelhorCaso_3[] = vetMelhorCaso_1.clone();
        int vetPiorCaso_3[] = vetPiorCaso_1.clone();

        int vetAleatorio_4[] = vetAleatorio_1.clone();
        int vetMelhorCaso_4[] = vetMelhorCaso_1.clone();
        int vetPiorCaso_4[] = vetPiorCaso_1.clone();

        long inicio, fim, tempoS, tempoMS;

        //////// ORDENAÇÃO RUIM ! /////////////////
        System.out.println("bubble");
        //--- ALEATORIO ---//
        inicio = System.currentTimeMillis();
        ordenar(vetAleatorio_1, N);
        fim = System.currentTimeMillis();
        tempoS = (fim - inicio) / 1000;
        tempoMS = (fim - inicio) - tempoS * 1000;
        System.out.println("Tempo de ordenacao Aleatorio: " + tempoS + "s" + tempoMS + "ms");
        //--- MELHOR CASO ---//
        inicio = System.currentTimeMillis();
        ordenar(vetMelhorCaso_1, N);
        fim = System.currentTimeMillis();
        tempoS = (fim - inicio) / 1000;
        tempoMS = (fim - inicio) - tempoS * 1000;
        System.out.println("Tempo de ordenacao Melhor Caso: " + tempoS + "s" + tempoMS + "ms");

        //--- PIOR CASO ---//
        inicio = System.currentTimeMillis();
        ordenar(vetPiorCaso_1, N);
        fim = System.currentTimeMillis();
        tempoS = (fim - inicio) / 1000;
        tempoMS = (fim - inicio) - tempoS * 1000;
        System.out.println("Tempo de ordenacao Pior Caso: " + tempoS + "s" + tempoMS + "ms");
        System.out.println("--------------------------------------");

        //////// ORDENAÇÃO MELHORADO SEM TROCOU ! /////////////////
        System.out.println("bubble++ sem trocou");
        //--- ALEATORIO ---//
        inicio = System.currentTimeMillis();
        ordenarMelhoradoSemTrocou(vetAleatorio_4, N);
        fim = System.currentTimeMillis();
        tempoS = (fim - inicio) / 1000;
        tempoMS = (fim - inicio) - tempoS * 1000;
        System.out.println("Tempo de ordenacao(melhorado) Aleatorio: " + tempoS + "s" + tempoMS + "ms");

        //--- MELHOR CASO ---//
        inicio = System.currentTimeMillis();
        ordenarMelhoradoSemTrocou(vetMelhorCaso_4, N);
        fim = System.currentTimeMillis();
        tempoS = (fim - inicio) / 1000;
        tempoMS = (fim - inicio) - tempoS * 1000;
        System.out.println("Tempo de ordenacao(melhorado) Melhor Caso: " + tempoS + "s" + tempoMS + "ms");

        //--- PIOR CASO ---//
        inicio = System.currentTimeMillis();
        ordenarMelhoradoSemTrocou(vetPiorCaso_4, N);
        fim = System.currentTimeMillis();
        tempoS = (fim - inicio) / 1000;
        tempoMS = (fim - inicio) - tempoS * 1000;
        System.out.println("Tempo de ordenacao(melhorado) Pior Caso: " + tempoS + "s" + tempoMS + "ms");
        System.out.println("--------------------------------------");

        //////// ORDENAÇÃO MELHORADO ! /////////////////
        System.out.println("buble++");
        //--- ALEATORIO ---//
        inicio = System.currentTimeMillis();
        ordenarMelhorado(vetAleatorio_2, N);
        fim = System.currentTimeMillis();
        tempoS = (fim - inicio) / 1000;
        tempoMS = (fim - inicio) - tempoS * 1000;
        System.out.println("Tempo de ordenacao(melhorado) Aleatorio: " + tempoS + "s" + tempoMS + "ms");

        //--- MELHOR CASO ---//
        inicio = System.currentTimeMillis();
        ordenarMelhorado(vetMelhorCaso_2, N);
        fim = System.currentTimeMillis();
        tempoS = (fim - inicio) / 1000;
        tempoMS = (fim - inicio) - tempoS * 1000;
        System.out.println("Tempo de ordenacao(melhorado) Melhor Caso: " + tempoS + "s" + tempoMS + "ms");

        //--- PIOR CASO ---//
        inicio = System.currentTimeMillis();
        ordenarMelhorado(vetPiorCaso_2, N);
        fim = System.currentTimeMillis();
        tempoS = (fim - inicio) / 1000;
        tempoMS = (fim - inicio) - tempoS * 1000;
        System.out.println("Tempo de ordenacao(melhorado) Pior Caso: " + tempoS + "s" + tempoMS + "ms");
        System.out.println("--------------------------------------");

        /////////// ORDENAÇÃO MAIOR-MENOR ! /////////////////
        System.out.println("><");
        //--- ALEATORIO ---//
        inicio = System.currentTimeMillis();
        ordenarMaiorMenor(vetAleatorio_3, N);
        fim = System.currentTimeMillis();
        tempoS = (fim - inicio) / 1000;
        tempoMS = (fim - inicio) - tempoS * 1000;
        System.out.println("Tempo de ordenacao(maior-menor) Aleatorio: " + tempoS + "s" + tempoMS + "ms");

        //--- MELHOR CASO ---//
        inicio = System.currentTimeMillis();
        ordenarMaiorMenor(vetMelhorCaso_3, N);
        fim = System.currentTimeMillis();
        tempoS = (fim - inicio) / 1000;
        tempoMS = (fim - inicio) - tempoS * 1000;
        System.out.println("Tempo de ordenacao(maior-menor) Melhor Caso: " + tempoS + "s" + tempoMS + "ms");

        //--- PIOR CASO ---//
        inicio = System.currentTimeMillis();
        ordenarMaiorMenor(vetPiorCaso_3, N);
        fim = System.currentTimeMillis();
        tempoS = (fim - inicio) / 1000;
        tempoMS = (fim - inicio) - tempoS * 1000;
        System.out.println("Tempo de ordenacao(maior-menor) Pior Caso: " + tempoS + "s" + tempoMS + "ms");




    }

    static void inicializarVetor(int[] vet, int N, int s) {
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

    private static void exibirVetor(int[] vet, int N) {
        for (int i = 0; i < N; i++) {
            if (vet[i] < 10) {
                System.out.print("0" + vet[i] + " ");
            } else {
                System.out.print(vet[i] + " ");
            }
        }
        System.out.println("");
    }

    private static void troca(int[] vet, int a, int b) {
        int aux = vet[a];
        vet[a] = vet[b];
        vet[b] = aux;
    }

    private static void ordenar(int[] vet, int N) {
        for(int i=0; i<N; i++){
            for(int j=0; j<N-1; j++){
                if(vet[j]>vet[j+1])
                    troca(vet, j, j+1);
            }
        }
    }

    private static void ordenarMelhorado(int[] vet, int N) {
        boolean trocou = false;
        for(int i=0; i<N; i++){
            for(int j=0; j<(N-(i+1)); j++){
                if(vet[j]>vet[j+1]) {
                    troca(vet, j, j + 1);
                    trocou = true;
                }
            }
            if(trocou == false){
                return;
            }
        }
    }

    private static void ordenarMelhoradoSemTrocou(int[] vet, int N) {
        for(int i=0; i<N; i++){
            for(int j=0; j<(N-(i+1)); j++){
                if(vet[j]>vet[j+1]){
                    troca(vet, j, j+1);
                }
            }
        }
    }

    private static void ordenarMaiorMenor(int[] vet, int N) {
        int f = 0;
        int l = N-1;
        while(f<l){
//            System.out.print("f "+String.valueOf(f)+" - ");
//            System.out.print("l "+String.valueOf(l)+"\n");
            for(int i = f; i<l; i++){
                if(vet[i] > vet[i+1]){
                    troca(vet, i, i+1);
                }
            }
            for(int i = l; i>f; i--){
                if(vet[i] < vet[i-1]){
                    troca(vet, i, i-1);
                }
            }
            f++;
            l--;

        }
//        exibirVetor(vet, N);
    }


}