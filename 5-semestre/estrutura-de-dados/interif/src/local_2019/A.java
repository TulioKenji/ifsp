package local_2019;

import java.util.Arrays;
import java.util.Scanner;
import java.util.stream.Stream;

public class A {
    static void main() {

        var scanner =  new Scanner(System.in);

        double emul = 0.005/100;
        double liq = 0.0275/100;

        double tx =  scanner.nextDouble();
        int qtd =  scanner.nextInt();

        var unit = new double[qtd];
        var values = new double[qtd];
        var names = new String[qtd];
        var totalOps = new double[qtd];


        for (int i = -1; i < qtd; i++) {
            String x = scanner.nextLine();
            if(i == -1) continue;
            var parts = x.split(" ");
            names[i] = parts[0];
            unit[i] = Double.parseDouble(parts[1]);
            values[i] = Double.parseDouble(parts[2]);
            totalOps[i] = unit[i] * values[i];
        }

        var total = Arrays.stream(totalOps).sum();
        var totalcorr = (total * emul) + (total*liq) + (qtd*tx);

        var porc = new double[qtd];
        var porccorr = new double[qtd];

        var realOps = new double[qtd];
        var realUnit = new double[qtd];

        for(int i = 0; i < qtd; i++) {
            porc[i] = totalOps[i]/total;
            porccorr[i] = porc[i] * totalcorr;

            realOps[i] = totalOps[i] + porccorr[i];
            realUnit[i] = realOps[i]/unit[i];
        }

        for(int i = 0; i < qtd; i++) {
            System.out.printf(
                    "%s %.0f %.2f %.2f%n",
                    names[i],
                    unit[i],
                    realUnit[i],
                    realOps[i]
            );
        }
        System.out.printf("%.2f%n", total);
        System.out.printf("%.2f", totalcorr);
    }
}
