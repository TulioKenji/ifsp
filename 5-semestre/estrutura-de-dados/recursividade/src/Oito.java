import java.util.Scanner;

public class Oito {
    static void toBin(int x){
        if(x <= 1){
            System.out.println("1");
            return;
        }
        toBin(x/2);
        System.out.println(x%2);
    }

    static void main() {
        var scanner = new Scanner(System.in);
        System.out.println("digite o x");
        final int x = scanner.nextInt();
        toBin(x);
    }
}
