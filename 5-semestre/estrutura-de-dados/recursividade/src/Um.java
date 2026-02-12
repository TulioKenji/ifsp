import java.util.Scanner;

public class Um {
    static void exibeRec(int n){
        if(n==0){
            return;
        }
        exibeRec(n-1);
        System.out.println(n);
    }

    static void main() {
        var scanner = new Scanner(System.in);
        System.out.println("digite o N");
        int n = scanner.nextInt();
        exibeRec(n);

    }
}
