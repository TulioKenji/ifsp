import java.util.Scanner;

public class Dois {
    static int fatorial(int x){
        if(x <= 0) return 1;

        return x*fatorial(x-1);
    }

    static void main() {
        var scanner = new Scanner(System.in);
        System.out.println("digite o x");
        final int x = scanner.nextInt();
        System.out.println(fatorial(x));
    }
}
