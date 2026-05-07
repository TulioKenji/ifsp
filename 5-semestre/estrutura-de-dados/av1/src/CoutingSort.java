public class CoutingSort implements Ordenar{
    @Override
    public void ordenar(int[]array, int tam){
        countingSort(array, 0, tam);
    }

    @Override
    public String nome(){
        return "CoutingSort";
    }

    public void countingSort(int[] array, int leftIndex, int rightIndex) {

        if (array == null || array.length == 0 || leftIndex >= rightIndex) return;

        // Encontrar o maior valor
        int k = array[leftIndex];
        for (int m = leftIndex; m <= rightIndex; m++) {
            if (array[m] > k) {
                k = array[m];
            }
        }

        // Cria vetor com o tamanho do maior elemento
        int[] vetorTemporario = new int[k + 1];

        // Contagem das ocorrencias
        for (int j = leftIndex; j <= rightIndex; j++) {
            vetorTemporario[array[j]]++;
        }

        // Prefix sum
        for (int i = 1; i <= k; i++) {
            vetorTemporario[i] += vetorTemporario[i - 1];
        }

        // Ordenando (estável)
        int[] vetorAuxiliar = new int[array.length];
        for (int j = rightIndex; j >= leftIndex; j--) {
            vetorAuxiliar[vetorTemporario[array[j]] - 1] = array[j];
            vetorTemporario[array[j]]--;
        }

        // Copiando de volta
        for (int i = leftIndex; i <= rightIndex; i++) {
            array[i] = vetorAuxiliar[i];
        }
    }
}
