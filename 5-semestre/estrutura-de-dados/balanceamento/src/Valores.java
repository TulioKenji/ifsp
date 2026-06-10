import java.io.File;
import java.io.FileNotFoundException;
import java.util.ArrayList;
import java.util.Scanner;

public class Valores {

    public static int[] retornar() {
        ArrayList<Integer> listaNumeros = new ArrayList<>();

        try {
            File arquivo = new File("src/valores.txt");
            Scanner leitor = new Scanner(arquivo);

            while (leitor.hasNextInt()) {
                listaNumeros.add(leitor.nextInt());
            }
            leitor.close();

        } catch (FileNotFoundException e) {
            System.out.println("Erro: O arquivo 'valores.txt' não foi encontrado.");
            e.printStackTrace();
        }

        int[] arrayDeValores = new int[listaNumeros.size()];
        for (int i = 0; i < listaNumeros.size(); i++) {
            arrayDeValores[i] = listaNumeros.get(i);
        }

        return arrayDeValores;
    }
}