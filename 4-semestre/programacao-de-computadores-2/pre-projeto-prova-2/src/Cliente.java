import java.io.IOException;
import java.io.PrintStream;
import java.net.Socket;
import java.util.Scanner;

public class Cliente {
    public static void main(String[] args) throws IOException {
        Socket cliente = new Socket("127.0.0.1", 12345);

        Scanner entrada = new Scanner(cliente.getInputStream());
        PrintStream saida = new PrintStream(cliente.getOutputStream());
        Scanner teclado = new Scanner(System.in);

        while(entrada.hasNextLine()) {
            System.out.println(entrada.nextLine());
            saida.println(teclado.nextLine());
        }
    }
}
