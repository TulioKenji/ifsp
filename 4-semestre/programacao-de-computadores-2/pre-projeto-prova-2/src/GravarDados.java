import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;

public class GravarDados extends Thread {

    private Pessoa pessoa;
    public static boolean emOperacao;

    public GravarDados(Pessoa pessoa) {
        this.pessoa = pessoa;
    }

    @Override
    public void run() {
        try {
            gravarDados();
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
        this.interrupt();
    }

    private synchronized void gravarDados() throws InterruptedException {
        while(emOperacao){
            try {
                wait();
            } catch (InterruptedException e) {}
        }
        emOperacao = true;
        try {
            Path caminho = Paths.get("dados.txt");
            Files.writeString(caminho, pessoa.toString() + "\n", StandardOpenOption.CREATE, StandardOpenOption.APPEND);
        } catch (IOException e) {
            throw new RuntimeException(e);
        } finally{
            emOperacao = false;
            notifyAll();
        }
    }

}
