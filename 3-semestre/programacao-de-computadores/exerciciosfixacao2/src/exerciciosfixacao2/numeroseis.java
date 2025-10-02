
package exerciciosfixacao2;

import javax.swing.JOptionPane;


public class numeroseis {
    public static void main(String[] args) {
        int tam = Integer.parseInt(JOptionPane.showInputDialog("digite o tamanho do array"));
        int v1[] = new int[tam+1];
        int v2[] = new int[tam+1];
        for (int i = 0; i <=tam; i++) {
            v1[i] = Integer.parseInt(JOptionPane.showInputDialog("digite o " + i + " numero do primeiro array"));
        }
       for (int i = 0; i <=tam; i++) {
            v2[i] = Integer.parseInt(JOptionPane.showInputDialog("digite o " + i + " numero do segundo array"));   
        }
        
       System.out.printf("v1: "); 
       for (int i = 0; i <=tam; i++) {
            System.out.printf(" %d ", v1[i]); 
        }
       
        System.out.printf("\nv2: ");
        for (int i = 0; i <=tam; i++) {
            System.out.printf(" %d ", v2[i]); 
        }
        
        int v3[] = new int[tam*2];
        for (int i = tam; i >=0; i--) {
            v3[i] += v1[i]+ v2[i];
            if(v3[i]>9){
            v3[i] = v3[i] - 10;
            v3[i-1] = v3[i-1] + 1;
            
            }
        }
        
        System.out.printf("\nv3: ");
        for (int i = 0; i <=tam; i++) {
            System.out.printf(" %d ", v3[i]); 
        }
    }
}
