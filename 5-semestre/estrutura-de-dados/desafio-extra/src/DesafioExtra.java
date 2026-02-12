import java.util.Random;
import java.util.Scanner;

public class DesafioExtra {
    static void main() {
        var scanner = new Scanner(System.in);
        var random = new Random();

        System.out.println("Digite N");
        final int n = scanner.nextInt();
        System.out.println("Digite C");
        final int c = scanner.nextInt();
        var arr = new int[n];
        int i = 0;
        while(i<arr.length){
            int r = random.nextInt(1,99);
            boolean eq = false;
            for(int j = 0; j<=1; j++){
                if(r == arr[j]){
                    eq = true;
                }
            }
            if(!eq){
                arr[i] = r;
                i++;
            }
        }
        for(int j = 0; j<arr.length; j++){
            var str = new String[c];
            for(int k = 0; k<c; k++ ){


            }
        }

    }

}
