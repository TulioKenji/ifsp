public class SelectionSort implements Ordenar{
    @Override
    public void ordenar(int[] num, int tam) {
        int i, j, min, aux;

        for (i = 0; i < (tam); i++) {
            min = i;

            for (j = (i + 1); j < tam; j++) {
                if (num[j] < num[min]) {
                    min = j;
                }
            }

            if (i != min) {
                aux = num[i];
                num[i] = num[min];
                num[min] = aux;
            }
        }
    }

    @Override
    public String nome(){
        return "SelectionSort";
    }

}
