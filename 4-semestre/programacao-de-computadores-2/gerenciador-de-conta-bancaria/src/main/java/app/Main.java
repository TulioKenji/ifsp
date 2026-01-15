package app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;


@SpringBootApplication(scanBasePackages = {"controller", "dao", "model", "service"})
public class Main {
    public static void main(String[] args) {
        SpringApplication.run(Main.class, args);

        //Codigo para rodar a interface (electron)
        try {

            ProcessBuilder builder = new ProcessBuilder("cmd.exe", "/c", "npm start");
            builder.directory(new File("interface-gerenciador-de-conta-bancaria"));

            builder.redirectErrorStream(true);
            Process process = builder.start();

            // Captura a saída do terminal
            BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream())
            );
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println(line); // imprime a saída do Electron
            }

            int exitCode = process.waitFor();
            System.out.println("Processo finalizado com código: " + exitCode);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
