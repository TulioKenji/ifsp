import java.io.*;
import java.util.ArrayList;

public class quatro {
    static int[] lerArquivo() throws IOException {
        String arqLeitura = "entrada.txt";

        BufferedReader buffRead = new BufferedReader(new FileReader(arqLeitura));
        System.out.println("Lendo o arquivo " + arqLeitura);
        String linha = buffRead.readLine();
        var nums = new int[Integer.parseInt(linha)+1];
        int i = 0;
        while (linha != null) {
            nums[i] = Integer.parseInt(linha);
            linha = buffRead.readLine();
            i++;
        }
        buffRead.close();
        return nums;
    }

    static void escreverArquivo(String linha) throws IOException {
        String arqEscrita = "saida.txt";

        BufferedWriter buffWrite = new BufferedWriter(new FileWriter(arqEscrita,true));
        buffWrite.append(linha + "\n");
        buffWrite.close();

    }

    static void main() throws IOException {
        int[] nums = lerArquivo();
        int l = nums[0];
        for(int i = 1; i< nums.length; i++){
            System.out.println(nums[i]);
        }
        for(int i = l; i>=1; i--){
            escreverArquivo(String.valueOf(nums[i]));
        }
    }
}
