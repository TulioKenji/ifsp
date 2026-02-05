import java.util.Scanner;
import java.util.Random;

public class tres {
    static void Insere_Exclusivo (int[]vet, int n){
        var random = new Random();
        int p = 0;
        for(int i = 0; i<n; i++){
            int r = random.nextInt(1,n);
            boolean eq = false;
            for(int j = 0; j<=i; j++){
                if(vet[j] == r){
                    eq = true;
                }
            }
            if(eq == false){
                vet[p] = r;
                p++;
            }
        }
        for(int i = 0; i<n; i++){
            System.out.println(vet[i]);
        }
    }

    static void main() {
        Scanner scanner = new Scanner(System.in);
        System.out.println("digite o valor N");
        final int nValue = scanner.nextInt();
        var vet = new int[nValue];
        Insere_Exclusivo(vet, nValue);

    }
}
