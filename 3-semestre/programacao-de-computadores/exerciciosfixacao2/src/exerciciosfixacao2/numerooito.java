package exerciciosfixacao2;
import  java.util.Scanner;

public class numerooito {
    public static void main(String[] args) {
        int tam = 0;
        Scanner array = new Scanner(System.in);
        System.out.println("digite o tamanho do array");
        tam = array.nextInt();
        int[] v1 = new int[tam+1];
        for (int i = 0; i<=tam; i++){
            System.out.printf("digite a posicao %d do array: ", i);
            v1[i] = array.nextInt();
        }

        //
        System.out.printf("v1 = {");
        for (int i = 0; i<=tam; i++){
            System.out.printf(" %d ", v1[i]);
        }
        System.out.printf("}");

        //

        int temp = 0;
        for (int i = 0; i <=tam; i++){
            for(int ii = 0; ii<=tam; ii++){
                if(v1[ii] > v1[i]){
                    temp = v1[i];
                    v1[i] = v1[ii];
                    v1[ii] = temp;
                }
            }
        }

        //
        System.out.printf("\nv1 ordenado = {");
        for (int i = 0; i<=tam; i++){
            System.out.printf(" %d ", v1[i]);
        }
        System.out.printf("}");
    }
}
