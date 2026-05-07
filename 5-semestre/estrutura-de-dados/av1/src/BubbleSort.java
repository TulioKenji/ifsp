public class BubbleSort implements Ordenar {
    static void swap(int[] v, int a, int b) {
        int temp = v[a];
        v[a] = v[b];
        v[b] = temp;
    }

    @Override
    public void ordenar(int[] vet, int N) {
        boolean trocou = true;
        int i = 0;
        while (trocou) {
            trocou = false;
            for (int j = 0; j < (N - i - 1); j++) {
                if (vet[j] > vet[j + 1]) {
                    swap(vet, j, j + 1);
                    trocou = true;
                }
            }
            i++;
        }
    }

    @Override
    public String nome() {
        return "BubbleSort";
    }

}
