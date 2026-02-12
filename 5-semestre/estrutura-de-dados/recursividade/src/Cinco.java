import java.util.Scanner;

public class Cinco {
    static void menorVet(int[]vet, int x, int p){
        if(p == 0){
            System.out.println(x);
            return;
        }
        if(x < vet[p]){
            menorVet(vet, x, p-1);
        }else{
            menorVet(vet, vet[p], p-1);
        }
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
        menorVet(vet, vet[vet.length-1], vet.length-1);
    }
}
