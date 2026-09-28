import java.util.Scanner;

public class velha {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        char[][] grid = new char[3][3];
        boolean temVazio = false;

        // 1. Leitura completa do tabuleiro e preenchimento da matriz
        for (int i = 0; i < 3; i++) {
            String data = scanner.nextLine();
            grid[i][0] = data.charAt(0);
            grid[i][1] = data.charAt(1);
            grid[i][2] = data.charAt(2);

            if (data.contains("#")) {
                temVazio = true;
            }
        }

        // 2. CHECAGEM DE VITÓRIA (Deve vir antes de qualquer definição de empate)

        // Checa Linhas
        for (int i = 0; i < 3; i++) {
            if (grid[i][0] == grid[i][1] && grid[i][1] == grid[i][2] && grid[i][0] != '#') {
                System.out.println(grid[i][0] + " venceu!");
                scanner.close();
                return;
            }
        }

        // Checa Colunas
        for (int i = 0; i < 3; i++) {
            if (grid[0][i] == grid[1][i] && grid[1][i] == grid[2][i] && grid[0][i] != '#') {
                System.out.println(grid[0][i] + " venceu!");
                scanner.close();
                return;
            }
        }

        // Checa Diagonal Principal
        if (grid[0][0] == grid[1][1] && grid[1][1] == grid[2][2] && grid[0][0] != '#') {
            System.out.println(grid[0][0] + " venceu!");
            scanner.close();
            return;
        }

        // Checa Diagonal Secundária
        if (grid[2][0] == grid[1][1] && grid[1][1] == grid[0][2] && grid[2][0] != '#') {
            System.out.println(grid[2][0] + " venceu!");
            scanner.close();
            return;
        }

        // 3. SE NINGUÉM VENCEU, CHECA O ESTADO DO TABULEIRO
        if (temVazio) {
            System.out.println("Jogo em andamento");
        } else {
            System.out.println("Velha!");
        }

        scanner.close();
    }
}