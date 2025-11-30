import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;

public class Servidor {

    public static void main(String[] args) throws IOException {
        int port = 12345;
        ServerSocket servidor = new ServerSocket(port);
        while (true) {
            Socket cliente = servidor.accept();
            LerDados lerDados = new LerDados(cliente);
            lerDados.start();
        }
    }
}
