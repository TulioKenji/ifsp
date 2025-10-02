/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Main.java to edit this template
 */
package exerciciosfixacao2;

import javax.swing.JOptionPane;


public class numeroum {

    /**
     * @param args the command line arguments
     */
    public static void main(String[] args) {
        int dia = Integer.parseInt(JOptionPane.showInputDialog("digite o dia"));
        int mes = Integer.parseInt(JOptionPane.showInputDialog("digite o mes"));
        int ano = Integer.parseInt(JOptionPane.showInputDialog("digite o ano"));
        
        JOptionPane.showMessageDialog(null, dia+"/"+mes+"/"+ano);
        
        int D = dia;
        int M = 0;
        switch (mes){
            case 1: M = 11; break;
            case 2: M = 12; break;
            case 3: M = 1; break;
            case 4: M = 2; break;
            case 5: M = 3; break;
            case 6: M = 4; break; 
            case 7: M = 5; break;
            case 8: M = 6; break;
            case 9: M = 7; break;
            case 10: M = 8; break;
            case 11: M = 9; break;
            case 12: M = 10; break;
            default: System.out.println("error");;
        }
        int A = ano%100;
        int S = ano/100;
        
        //
        
        int TRUNCA = trunca(M);
        int QUOCIENTEA = quociente(A);
        int QUOCIENTES = quociente(S);
        int RESTO = TRUNCA + D + A + QUOCIENTEA + QUOCIENTES -2 * S;
        int DIADASEMANA = resto(RESTO);
        if((ano%4)!=0){
            DIADASEMANA =DIADASEMANA -1;
        }
        switch(DIADASEMANA){
            case 0: JOptionPane.showMessageDialog(null, "domingo"); break;
            case 1: JOptionPane.showMessageDialog(null, "segunda"); break;
            case 2: JOptionPane.showMessageDialog(null, "terca"); break;
            case 3: JOptionPane.showMessageDialog(null, "quarta"); break;
            case 4: JOptionPane.showMessageDialog(null, "quinta"); break;
            case 5: JOptionPane.showMessageDialog(null, "sexta"); break;
            case 6: JOptionPane.showMessageDialog(null, "sabado"); break;
            default: JOptionPane.showMessageDialog(null, DIADASEMANA);
        }
        
    }
    
    public static int resto(int n){
        return n%7;
    }
    
    public static int trunca(int n){
        return (int) (2.6*n-0.1);
    }
    
    public static int quociente(int n){   
        return n/4;
    }
}

// RESTO ((TRUNCA(2,6 * M – 0,1) + D + A + QUOCIENTE(A, 4) + QUOCIENTE(S, 4) – 2 * S), 7)