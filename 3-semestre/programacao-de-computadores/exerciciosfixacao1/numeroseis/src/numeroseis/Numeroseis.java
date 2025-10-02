/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Main.java to edit this template
 */
package numeroseis;
import java.util.Scanner; 

public class Numeroseis {

    /**
     * @param args the command line arguments
     */
    public static void main(String[] args) {
        int num1 = 0;
        int num2 = 0;
        Scanner lernum = new Scanner(System.in);
        System.out.println("digite o primeiro numero");
        num1 = lernum.nextInt();
        System.out.println("digite o segundo numero");
        num2 = lernum.nextInt();
        soma(num1,num2);
        subtracao(num1,num2);
        multiplicacao(num1,num2);
        divisao(num1,num2);
    }
    
    public static void soma(int a, int b){
        int res = a+b;
        System.out.println(a + " + " + b + " = " + res);
    }
    public static void subtracao(int a, int b){
        int res = a-b;
        System.out.println(a + " - " + b + " = " + res);
    }
    public static void multiplicacao(int a, int b){
        int res = a*b;
        System.out.println(a + " * " + b + " = " + res);
    }
    public static void divisao(int a, int b){
        int res = a/b;
        System.out.println(a + " / " + b + " = " + res);
    }
}
