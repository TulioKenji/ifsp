package local_2025;

import java.util.Scanner;

public class H {
    static void main(String[] args) {
        var scanner  = new Scanner(System.in);
        var L = scanner.nextInt();
        var C = scanner.nextInt();
        var X = scanner.nextInt();
        var Y = scanner.nextInt();
        var D = scanner.nextInt();
        var H = scanner.nextInt();

        boolean todas = false;
        for (int i = 0; i < H; i++) {
            var xH = scanner.nextInt();
            var yH = scanner.nextInt();

            var xD = Math.pow(xH > X ? xH - X : X - xH,2);
            var yD = Math.pow(yH > Y ? yH - Y : Y - yH,2);
            var rD = Math.sqrt(xD + yD);
            if(rD <= D){
                todas = true;
                break;
            }
        }

        if(todas){
            System.out.println("Uma casinha no meio de todas");
        }else{
            System.out.println("Uma casinha no meio do nada");
        }
    }
}
