public class BubbleSort {
    static void swap(int[] v, int a, int b) {
        int temp = v[a];
        v[a] = v[b];
        v[b] = temp;
    }

    static void bubbleSort(int[] v, int n) {
        if (n < 1) return;

        for (int i = 0; i < n; i++) {
            if (v[i] > v[i + 1]) {
                swap(v, i, i + 1);
            }
        }

        bubbleSort(v, n - 1);
    }

    public static void main(String[] args) {
        int N = 41000;

        int v[] = new int[N];
        inicializarVetor(v, N, 0);

        var begin = System.currentTimeMillis();
        // n deve ser tamanho - 1 (igual ao comportamento do código em C)
        bubbleSort(v, v.length - 1);
        var end = System.currentTimeMillis();
        System.out.println((end-begin));
        // Exibir resultado
//        for (int num : v) {
//            System.out.print(num + " ");
//        }
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
}
