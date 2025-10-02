/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Main.java to edit this template
 */
package numerocinco;

import java.util.Scanner;

public class Numerocinco {

    /**
     * @param args the command line arguments
     */
    public static void main(String[] args) {
        int num = 0;
        Scanner leitornum = new Scanner(System.in);
        System.out.println("Digite o numero de 3 digitos: ");
        num = leitornum.nextInt();
        
        int c = num/100;
        int d = (num / 10) % 10;
        int u = num%10;
        u = u*100;
        d = d *10;
        System.out.println(u+d+c);

        
    }
    
}
