/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Main.java to edit this template
 */
package numerotres;
import java.util.Scanner; 

public class Numerotres {

    /**
     * @param args the command line arguments
     */
    public static void main(String[] args) {
        double premio = 0;
        Scanner telesena = new Scanner(System.in);
        System.out.println("digite o valor do premio: ");
        premio = telesena.nextDouble();
        double sena = premio*0.6;
        double quina = premio*0.3;
        double quadra = premio*0.1;
        System.out.println("sena: " + sena);
        System.out.println("quina: " + quina);
        System.out.println("quadra:" + quadra);
    }
    
}
