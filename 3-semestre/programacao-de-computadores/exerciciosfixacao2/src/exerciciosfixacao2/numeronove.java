package exerciciosfixacao2;

import java.util.Scanner;

public class numeronove {
    public static void main(String[] args) {
        int linha = 0;
        int coluna = 0;
        Scanner matriz = new Scanner(System.in);
        System.out.println("digite o tamanho da linha da matriz");
        linha = matriz.nextInt();
        System.out.println("digite o tamanho da coluna da matriz");
        coluna = matriz.nextInt();
        int[][] m1 = new int[linha+1][coluna+1];
        for(int i = 0;i<=linha;i++){
            for (int ii=0; ii<=coluna;ii++){
                System.out.println("digite a coluna " + ii + " da linha " + i);
                m1[i][ii] = matriz.nextInt();
            }
        }
        System.out.printf("m1 = ");
        for(int i = 0;i<=linha;i++){
            System.out.printf("\n");
            for (int ii=0; ii<=coluna;ii++){
                System.out.printf(" %d ", m1[i][ii]);
            }
        }

        int minimax = 0;
        System.out.printf("\n");
        for(int i = 0;i<=linha;i++){
            for (int ii=0; ii<=coluna;ii++){
                if(m1[i][ii]>minimax){
                    minimax = m1[i][ii];
                }
            }
        }

        System.out.println("minimax: " + minimax);
    }
}
