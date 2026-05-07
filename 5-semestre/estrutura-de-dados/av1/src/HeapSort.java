public class HeapSort implements Ordenar{
    @Override
    public void ordenar(int[] vetor, int tamanho){
        tamanho = tamanho+1;
        int i = tamanho / 2, pai, filho, t;
        while (true){
            if (i > 0){
                i--; t = vetor[i];
            }else{
                tamanho--;
                if (tamanho <= 0) {return;}
                t = vetor[tamanho];
                vetor[tamanho] = vetor[0];
            }
            pai = i;
            filho = ((i * 2) + 1);
            while (filho < tamanho){
                if ((filho + 1 < tamanho) && (vetor[filho + 1] > vetor[filho])) {filho++;}
                if (vetor[filho] > t){
                    vetor[pai] = vetor[filho];
                    pai = filho;
                    filho = pai * 2 + 1;
                }else {break;}
            }
            vetor[pai] = t;
        }
    }

    @Override
    public String nome(){
        return "HeapSort";
    }
}
