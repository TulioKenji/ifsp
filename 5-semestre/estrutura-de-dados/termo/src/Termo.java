import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.util.Arrays;
import java.util.Scanner;

public class Termo {

    public static NoP raiz = null;

    public static void main(String[] args) throws IOException {
        Scanner sc = new Scanner(System.in);


        lerArquivo_e_Inserir("entrada.txt");
        exibeArvore(raiz, 0);
        //  System.out.println("Palavras inseridas: "+ tamanho(raiz));
        //  System.out.println("Profundidade: "+profundidade(raiz));
        remover("UNIAO");
        exibeArvore(raiz, 0);

        System.out.println(
                "O \"FILTRO\" trata-se de um string com 5 caracteres contendo as letras a serem removidas e o \n"
                        + "simbolo * para letras que devem ser desconsideradas.\n"
                        + "Por exemplo, se no jogo a palavra em formacao eh essa \"T____\" o filtro a ser digitado deve ser \n"
                        + "\"t****\" e o metodo removeParcial devera remover todas palavras que nao comecam com a letra T, se a \n"
                        + "palavra for \"__r_a\", o filtro sera \"**r*a\" e o metodo removeParcial devera remover todas\n"
                        + "as palavras em que o 3o caractere nao seja R e o ultimo nao seja A.\n");


        String filtro = "";
        do {
            System.out.print("\nDigite o FILTRO ou 0 para SAIR: ");
            filtro = sc.next();
            if (filtro.length() == 5) {
                filtro = filtro.toUpperCase();
                System.out.println("Filtrando: " + filtro);
                removeParcial(filtro);
            }
        } while (!filtro.equals("0"));


    }

    private static void lerArquivo_e_Inserir(String arqLeitura) throws FileNotFoundException, IOException {

        BufferedReader buffRead = new BufferedReader(new FileReader(arqLeitura));
        System.out.println("Lendo o arquivo " + arqLeitura);
        String linha = buffRead.readLine();
        int count = 0;
        while (linha != null) {

            // dividindo a linha de forma que cada palavra representa uma
            // posicao no vetor
            String[] palavrasNaLinha = linha.split(" ");

            // para cada palavra do vetor
            for (String palavra : palavrasNaLinha) {
                //selecionando somente as palavras com 5 caracteres
                if (palavra.length() == 5) {
                    palavra = palavra.toUpperCase();

                    boolean ehPalavra = true;
                    // nesse laço, percorre-se a palavra e a descarta caso
                    //contenha algum caractere especial
                    for (int i = 0; i < 5; i++) {
                        int c = palavra.charAt(i);
                        if (c < 64)
                            ehPalavra = false;
                        if (c > 233)
                            ehPalavra = false;

                    }
                    //se (de forma grosseira) não foi encontrado nenhum 
                    //caractere especial
                    if (ehPalavra) {
                        // substituição das letras acentuadas 
                        palavra = removerAcentos(palavra);
                        // inserção na árvore
                        inserirExclusivo(palavra);
                        count++;
                        if (count > 9) break;
                    }

                }
            }
            if (count > 9) break;
            linha = buffRead.readLine();
        }
        buffRead.close();
    }

    private static String removerAcentos(String palavra) {


        for (int i = 0; i < 5; i++) {
            String troca = palavra;
            switch ((int) palavra.charAt(i)) {
                case 192:
                    troca = palavra.replace('À', 'A');
                    break;
                case 193:
                    troca = palavra.replace('Á', 'A');
                    break;
                case 194:
                    troca = palavra.replace('Â', 'A');
                    break;
                case 195:
                    troca = palavra.replace('Ã', 'A');
                    break;
                case 199:
                    troca = palavra.replace('Ç', 'C');
                    break;
                case 200:
                    troca = palavra.replace('È', 'E');
                    break;
                case 201:
                    troca = palavra.replace('É', 'E');
                    break;
                case 202:
                    troca = palavra.replace('Ê', 'E');
                    break;
                case 204:
                    troca = palavra.replace('Ì', 'I');
                    break;
                case 205:
                    troca = palavra.replace('Í', 'I');
                    break;
                case 210:
                    troca = palavra.replace('Ò', 'O');
                    break;
                case 211:
                    troca = palavra.replace('Ó', 'O');
                    break;
                case 212:
                    troca = palavra.replace('Ô', 'O');
                    break;
                case 213:
                    troca = palavra.replace('Õ', 'O');
                    break;
                case 217:
                    troca = palavra.replace('Ù', 'U');
                    break;
                case 218:
                    troca = palavra.replace('Ú', 'U');
                    break;
            }
            palavra = troca;

        }

        return palavra;
    }

    private static void removeParcial(String filtro) {
        var letras = new char[4];
        for (int i = 0; i < filtro.length(); i++) {
            letras[i] = filtro.charAt(i);
        }

    }

    private static void inserirExclusivo(String p) {
        if (!existe(p)) {

            NoP novo = new NoP(p);

            if (raiz == null) {
                raiz = novo;
            } else {

                NoP temp = raiz;
                boolean inseriu = false;

                while (!inseriu) {
                    int comparador = novo.palavra.compareTo(temp.palavra);
                    if (comparador <= 0) {
                        if (temp.esq == null) {
                            temp.esq = novo;
                            inseriu = true;
                        } else {
                            temp = temp.esq;
                        }
                    } else {
                        if (temp.dir == null) {
                            temp.dir = novo;
                            inseriu = true;
                        } else {
                            temp = temp.dir;
                        }
                    }
                }
            }
        }
    }

    public static void exibir(NoP temp) {
        if (temp != null) {
            exibir(temp.esq);
            System.out.println(temp.palavra);
            exibir(temp.dir);
        }
    }

    private static int profundidade(NoP temp) {
        if (temp != null) {
            if (ehFolha(temp)) {
                return 0;
            } else {
                int x = profundidade(temp.esq);
                int y = profundidade(temp.dir);
                int r = (x > y) ? x : y;
                return r + 1;
            }
        }
        return -1;
    }

    private static boolean ehFolha(NoP temp) {
        if ((temp.esq == null) && (temp.dir == null)) {
            return true;
        }
        return false;
    }

    private static int tamanho(NoP temp) {
        if (temp != null) {
            return 1 + tamanho(temp.esq) + tamanho(temp.dir);
        }

        return 0;
    }

    private static boolean existe(String p) {
        NoP temp = raiz;
        while (temp != null) {
            if (temp.palavra.equals(p))
                return true;
            else {
                int comparador = p.compareTo(temp.palavra);
                if (comparador <= 0)
                    temp = temp.esq;
                else
                    temp = temp.dir;
            }
        }


        return false;
    }

    static void remover(String x) {
        if (raiz.palavra.equals(x)) {
            if ((raiz.esq == null) && (raiz.dir == null))
                raiz = null;
            else if ((raiz.esq != null) && (raiz.dir != null))
                removeDoisFilhos(raiz, x);
            else if (raiz.esq == null)
                raiz = raiz.dir;
            else
                raiz = raiz.esq;
        } else
            removeNo(raiz, x);
    }

    static void removeNo(NoP n, String x) {

        int f = contaFilhos(n, x);

        switch (f) {
            case -1:
                System.out.println("O nó não existe na árvore");
                break;
            case 0:
                removeFolha(n, x);
                break;
            case 1:
                removeUmFilho(n, x);
                break;
            case 2:
                removeDoisFilhos(n, x);
                break;
        }
    }

    static int contaFilhos(NoP n, String x) {
        if (n == null) {
            return -1;
        }
        if (!x.equals(n.palavra)) {
            int a = contaFilhos(n.dir, x);
            int b = contaFilhos(n.esq, x);
            return (a > b) ? a : b;
        }
        if (n.esq == null && n.dir == null) {
            return 0;
        }
        if (n.esq == null || n.dir == null) {
            return 1;
        }
        return 2;
    }

    static void removeFolha(NoP n, String x) {
        if(ehFolha(n)) {
            return;
        }

        if(n.esq == null){
            if(n.dir.palavra.equals(x)){
                n.dir = null;
                return;
            }
            removeFolha(n.dir, x);
            return;
        }
        if(n.dir == null){
            if(n.esq.palavra.equals(x)){
                n.esq = null;
                return;
            }
            removeFolha(n.esq, x);
            return;
        }
        if(n.dir.palavra.equals(x)){
            n.dir = null;
            return;
        }
        if(n.esq.palavra.equals(x)){
            n.esq = null;
            return;
        }
        removeFolha(n.esq, x);
        removeFolha(n.dir, x);
    }

    static void removeUmFilho(NoP n, String x) {
        if (ehFolha(n)) {
            n = null;
            return;
        }
        if (n.esq == null) {
            n = n.dir;
            return;
        }
        n = n.esq;
    }

    static void removeDoisFilhos(NoP n, String x) {
        if (ehFolha(n)) {
            n = null;
            return;
        }
        if (n.dir == null) {
            if (n.esq.dir != null) {
                n = n.esq.dir;
                return;
            }
            n = n.esq;
        }

        if (n.dir.esq != null) {
            n = n.dir.esq;
            return;
        }
        n = n.dir;
    }

    static void exibeArvore(NoP n, int x) {
        if (raiz == null) {
            System.out.println("vazio");
            return;
        }

        if (n.dir != null)
            exibeArvore(n.dir, x + 1);
        else
            System.out.println();

        for (int i = 1; i <= x; i++)
            System.out.print("|  ");

        if ((n.esq == null) && (n.dir == null))
            System.out.print("[" + n.palavra + "]");
        else
            System.out.print(n.palavra);

        if (n.esq != null)
            exibeArvore(n.esq, x + 1);
        else
            System.out.println();


    }
}