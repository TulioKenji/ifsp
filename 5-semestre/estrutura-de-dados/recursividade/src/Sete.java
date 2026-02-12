import java.util.Scanner;

public class Sete {
    static String string(String s){
        if(s == null || s.isEmpty()){
            return s;
        }
        return string(s.substring(1))+ s.charAt(0);
    }

    static void main() {
        var scanner = new Scanner(System.in);
        System.out.println("digite a string");
        final String x = scanner.nextLine();
        System.out.println(string(x));
    }
}
