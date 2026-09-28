package local_if;

import java.util.Scanner;

public class A {
    public static void main(String[] args) {
        var scanner = new Scanner(System.in);
        var grid = new char[3][3];
        boolean vVv = true;

        for (int i = 0; i < 3; i++) {
            var data = scanner.nextLine();
            if(data.contains("#")){
                vVv = false;
            }
            grid[i][0] = data.charAt(0);
            grid[i][1] = data.charAt(1);
            grid[i][2] = data.charAt(2);
            if(grid[i][0] == grid[i][1] && grid[i][1] == grid[i][2] && data.charAt(0) != '#'){
                System.out.println(data.charAt(0) + " venceu!");
                return;
            }
        }

        for (int i = 0; i < 3; i++) {
            if(grid[0][i] == grid[1][i] && grid[1][i] == grid[2][i] && grid[2][i] != '#'){
                System.out.println(grid[0][i] + " venceu!");
                return;
            }
        }

        if(grid[0][0] == grid[1][1] &&  grid[1][1] == grid[2][2] && grid[2][2] != '#'){
            System.out.println(grid[0][0] + " venceu!");
            return;
        }
        if(grid[2][0] == grid[1][1] &&  grid[1][1] == grid[0][2] && grid[0][2] != '#'){
            System.out.println(grid[2][0] + " venceu!");
            return;
        }


        if(vVv){
            System.out.println("Velha!");
            return;
        }
        System.out.println("Jogo em andamento");
    }
}
//xoo
//ox#
//x#x