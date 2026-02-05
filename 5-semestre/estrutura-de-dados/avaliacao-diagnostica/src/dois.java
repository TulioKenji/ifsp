import java.util.Scanner;
import java.util.Random;

public class dois {
    static void main() {
        Scanner scanner = new Scanner(System.in);
        System.out.println("digite o valor N");
        final int nValue = scanner.nextInt();
        System.out.println("digite o valor M");
        final int mValue = scanner.nextInt();
        Random random = new Random();
        var nArray = new int[nValue];
        for(int i = 0; i< nArray.length; i++){
            System.out.println(random.nextInt(0,mValue));
        }
    }
}
