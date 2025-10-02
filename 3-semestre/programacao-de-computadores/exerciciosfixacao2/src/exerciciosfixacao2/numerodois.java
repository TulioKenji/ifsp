/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package exerciciosfixacao2;

import javax.swing.JOptionPane;

public class numerodois {
    public static void main(String[] args) {
        while(true) {
            int dia = Integer.parseInt(JOptionPane.showInputDialog("digite o dia"));
            int mes = Integer.parseInt(JOptionPane.showInputDialog("digite o mes"));
            int ano = Integer.parseInt(JOptionPane.showInputDialog("digite o ano"));

            boolean verificador = verifica(dia, mes, ano);
            if(verificador == false){
                JOptionPane.showMessageDialog(null, "data invalida");
            }
            else{
                JOptionPane.showMessageDialog(null, "data valida " +dia + "/" + mes + "/" + ano);
                break;
            }

        }
    }

    public static boolean verifica(int d, int m, int a){
        if((d > 31) || (d <= 0)){
            return false;
        }
        if((m > 12) || (m <= 0)){
            return false;
        }
        if(a <= 0){
            return false;
        }
        if((d>29) &&(m == 2)){
            return false;
        }
        if( ((m == 4) &&(d > 30)) || ((m == 6) &&(d > 30)) || ((m == 9) &&(d > 30)) || ((m == 11) &&(d > 30)) ){
            return false;
        }
        if( (d > 28) && (m == 2) && ((a%4 != 0) || (a%400 != 0) && (a%100 == 0)) ){
            return false;
        }
        else{
        return true;
        }

    }
}
