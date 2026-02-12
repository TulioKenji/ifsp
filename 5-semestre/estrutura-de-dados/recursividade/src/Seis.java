import java.util.Scanner;

public class Seis {
    static int digitos(int x){
        if(x<10){
            return 1;
        }
        return 1+digitos(x/10);
    }

    static void main() {
        var scanner = new Scanner(System.in);
        System.out.println("digite o x");
        final int x = scanner.nextInt();
        System.out.println(digitos(x));
    }
}
