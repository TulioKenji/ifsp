/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Main.java to edit this template
 */
package numeroquatro;
import java.util.Scanner; 

public class Numeroquatro {

    /**
     * @param args the command line arguments
     */
    public static void main(String[] args) {
        double capital = 0;
        double taxa = 0;
        double tempo = 0;
        Scanner emp = new Scanner(System.in);
        System.out.println("digite o capital: ");
        capital = emp.nextDouble();
        System.out.println("digite a taxa de juros ao mes: ");
        taxa = emp.nextDouble();
        System.out.println("digite o tempo em meses");
        tempo = emp.nextDouble();
        double juros = (capital*taxa*tempo)/100;
        System.out.println("juros: " + juros);
       
    }
    
}
