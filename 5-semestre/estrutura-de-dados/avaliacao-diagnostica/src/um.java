import java.util.ArrayList;
import java.util.Scanner;

public class um {
    static void main() {
        Scanner scanner = new Scanner(System.in);
        System.out.println("digite o valor N");
        final int nValue = scanner.nextInt();
        var nArray = new int[nValue];
        for(int i = 0; i< nArray.length; i++){
            System.out.printf("digite o "+ String.valueOf(i) + " numero: ");
            nArray[i] = scanner.nextInt();
        }
        for(int i = nValue-1; i>=0; i--){
            System.out.println(nArray[i]);
        }
    }
}
