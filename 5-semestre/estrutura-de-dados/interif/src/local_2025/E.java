package local_2025;

public class E {
    static void main() {
        var scanner =  new java.util.Scanner(System.in);
        final var a = scanner.nextInt() + 1;
        final var l = scanner.nextInt() + 1;
        var pista = new int[a+1][l+1];

        for (int i = 1; i < a; i++) {
            for (int j = 1; j < l; j++) {
                pista[i][j] = scanner.nextInt();
            }
        }

//        for (int i = 0; i < a+2; i++) {
//            for (int j = 0; j < l+2; j++) {
//                System.out.print(pista[i][j]);
//            }
//            System.out.println();
//        }

        int curvas = 0;
        int x = 0;
        int y = 0;

        for (int i = 1; i < a; i++) {
            for (int j = 1; j < l; j++) {
                if(pista[i][j] == 1){
                    x = i;
                    y = j;
                    break;
                }
            }
        }

        final int comecox = x;
        final int comecoy = y;
        int dirx = 0;
        int diry = 0;

        while (true) {
            if(pista[comecox+1][comecoy] == 1){
                dirx = 1;
                x = comecox+1;
                break;
            }
            if(pista[comecox-1][comecoy] == 1){
                dirx = -1;
                x = comecox-1;
                break;
            }
            if(pista[comecox][comecoy+1] == 1){
                diry = 1;
                y = comecoy+1;
                break;
            }
            if(pista[comecox][comecoy-1] == 1){
                diry = -1;
                y = comecoy-1;
                break;
            }
            break;
        }


        do{
            int tx =x+dirx;
            int ty =y+diry;

            if(pista[tx][ty] != 1){
                if(pista[tx][ty] == 2){
                    curvas++;
                }
                if( (pista[x+1][y] == 1) && (dirx != -1) ){
                    dirx = 1;
                    diry = 0;
                    x +=  dirx;
                    y +=  diry;
                    continue;
                }
                if( (pista[x-1][y] == 1) && (dirx != 1) ){
                    dirx = -1;
                    diry = 0;
                    x +=  dirx;
                    y +=  diry;
                    continue;
                }
                if( (pista[x][y+1] == 1) && (diry != -1) ){
                    dirx = 0;
                    diry = 1;
                    x +=  dirx;
                    y +=  diry;
                    continue;
                }
                if( (pista[x][y-1] == 1) && (diry != 1) ){
                    dirx = 0;
                    diry = -1;
                    x +=  dirx;
                    y +=  diry;
                    continue;
                }
            }
            x +=  dirx;
            y +=  diry;
        }while( (comecox != x) || (comecoy != y));
        System.out.println(curvas);
    }
}
