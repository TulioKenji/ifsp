/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Main.java to edit this template
 */
package numeroum;
import java.util.Scanner;

public class Numeroum {

   
    public static void main(String[] args) {
        double f = 0;
        Scanner grausf = new Scanner(System.in);
        System.out.println("Digite o numero de graus em F: ");
        f = grausf.nextDouble();
        double c =  (f-32) * 5/9;
        System.out.println("Graus em C: " + c );
    }
    
}
