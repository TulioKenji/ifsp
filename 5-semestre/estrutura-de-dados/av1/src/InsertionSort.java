public class InsertionSort implements Ordenar{
    @Override
    public void ordenar(int[] vetor, int tam){

        for (int i = 1; i < vetor.length; i++){

            int aux = vetor[i];
            int j = i;

            while ((j > 0) && (vetor[j-1] > aux)){
                vetor[j] = vetor[j-1];
                j -= 1;
            }
            vetor[j] = aux;

        }
    }

    @Override
    public String nome(){
        return "InsertionSort";
    }
}
