/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Main.java to edit this template
 */
package numerodois;
import java.util.Scanner;

public class numerodois {

    /**
     * @param args the command line arguments
     */
    public static void main(String[] args) {
        Scanner scanidade = new Scanner(System.in);
        int dia = 0;
        int mes = 0;
        int ano= 0;
        System.out.println("anos: ");
        ano = scanidade.nextInt();
        System.out.println("meses: ");
        mes = scanidade.nextInt();
        System.out.println("dias: ");
        dia = scanidade.nextInt();
        int idade = (ano*365) + (mes*30) + dia;
        System.out.printf("sua idade e: %d dias\n", idade);
      
    }
    
}
