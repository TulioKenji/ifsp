import java.util.Scanner;

public class Quatro {
    static int soma(int[]vet, int x){
        if(x <=0) return 1;

        return vet[x]+soma(vet, x-1);
    }

    static void main() {
        var scanner = new Scanner(System.in);
        System.out.println("digite o vet");
        final String vetStr = scanner.nextLine();
        String[] spl = vetStr.split(" ");

        var vet = new int[spl.length];
        for(int i = 0; i< spl.length;i++){
            vet[i] = Integer.parseInt(spl[i]);
        }

        System.out.println(soma(vet, vet.length-1));
    }
}
