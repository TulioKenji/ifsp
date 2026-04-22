public class QuickSort implements Ordenar{
    @Override
    public void ordenar(int[] vet, int N) {
        quicksort(vet, 0, N);
    }

    @Override
    public String nome() {
        return "QuickSort";
    }

    static void quicksort(int[] values, int begin, int end) {
        // Caso base: array de 1 ou 0 elementos já está ordenado
        if (begin >= end) return;

        int i = begin;
        int j = end - 1;

        int pivo = values[begin + (end - begin) / 2];
        int aux;

        while (i <= j) {

            while (i < end && values[i] < pivo)
                i++;

            while (j >= begin && values[j] > pivo)
                j--;

            if (i <= j) {
                aux = values[i];
                values[i] = values[j];
                values[j] = aux;
                i++;
                j--;
            }
        }

        if (begin < j)
            quicksort(values, begin, j + 1);

        if (i < end)
            quicksort(values, i, end);
    }
}
