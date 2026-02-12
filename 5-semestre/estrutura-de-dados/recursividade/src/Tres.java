import java.util.Scanner;

public class Tres {
    static int pot(int x, int n){
        if(n<=0) return 1;

        return x*pot(x, n-1);
    }

    static void main() {
        var scanner = new Scanner(System.in);
        System.out.println("digite o x");
        final int x = scanner.nextInt();
        System.out.println("digite o n");
        final int n = scanner.nextInt();
        System.out.println(pot(x,n));
    }
}
