package exerciciosfixacao2;

import java.util.Scanner;

public class numerosete {
    public static void main(String[] args) {
        int tam = 0;
        Scanner array = new Scanner(System.in);

        System.out.println("digite o tamanho do array: ");
        tam = array.nextInt();
        int[] v1 = new int[tam+tam+1];
        int[] v2 = new int[tam+1];
        for (int i = 0; i<=tam; i++){
            System.out.println("digite a posicao " + i + " do array v1");
            v1[i] = array.nextInt();
        }
        for (int i = 0; i<=tam; i++){
            System.out.println("digite a posicao " + i + " do array v2");
            v2[i] = array.nextInt();
        }
        //
        int count = 0;
        int tam2 = tam;
        System.out.println("tam "+ tam);
        System.out.println("tam2 "+ tam2);
        for (int i = 0; i<=tam2; i++){
            for (int i2 = 0; i2<=tam2; i2++){
                if(v1[i2] == v2[i]){
                    count = count+1;
                }
                if ((count ==0) && (i2 == tam2)){
                    v1[tam+i] = v2[i];
                    count = 0;
                }
            }
        }
        System.out.printf("v1 = { ");
        for (int i = 0; i<(v1.length); i++){
            System.out.printf("%d ", v1[i]);
        }
        System.out.printf("}");
    }
}
