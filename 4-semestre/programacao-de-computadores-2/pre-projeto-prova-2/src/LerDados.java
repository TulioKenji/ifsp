import java.io.IOException;
import java.io.PrintStream;
import java.net.Socket;
import java.util.Scanner;

public class LerDados extends Thread {

    Socket cliente;
    public LerDados(Socket cliente) {
        this.cliente = cliente;
    }

    @Override
    public void run() {
        try {
            Scanner entrada = new Scanner(cliente.getInputStream());
            PrintStream saida = new PrintStream(cliente.getOutputStream());

            Pessoa pessoa = new Pessoa();

            saida.println("Informe o nome da pessoa: ");
            if(entrada.hasNextLine()){
                pessoa.setNome(entrada.nextLine());
            }
            saida.println("Informe o endereco da pessoa: ");
            if(entrada.hasNextLine()){
                pessoa.setEndereco(entrada.nextLine());
            }
            saida.println("Informe o CPF da pessoa: ");
            if(entrada.hasNextLine()){
                pessoa.setCpf(entrada.nextLine());
            }
            saida.println("Informe a idade da pessoa: ");
            if(entrada.hasNextLine()){
                pessoa.setIdade(Integer.parseInt(entrada.nextLine()));
            }
            saida.println("Informe a altura da pessoa: ");
            if(entrada.hasNextLine()){
                pessoa.setAltura(Integer.parseInt(entrada.nextLine()));
            }
            saida.println("Informe a data de nascimento da pessoa: ");
            if(entrada.hasNextLine()){
                pessoa.setDataNascimento(entrada.nextLine());
            }
            System.out.println(pessoa);

            cliente.close();
            GravarDados gravarDados = new GravarDados(pessoa);
            gravarDados.start();

            gravarDados.interrupt();
            this.interrupt();

        } catch (IOException e) {
            throw new RuntimeException(e);
        }

    }
}
