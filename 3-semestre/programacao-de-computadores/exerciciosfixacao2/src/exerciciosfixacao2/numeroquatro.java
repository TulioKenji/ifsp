
package exerciciosfixacao2;

import javax.swing.JOptionPane;
import java.util.Random;

public class numeroquatro {
    public static void main(String[] args) {
        int num = 0;
            while(true){
                
                num = Integer.parseInt(JOptionPane.showInputDialog("digite um numero de 1 a 99"));
                if((num <1) || (num >99)){
                    JOptionPane.showMessageDialog(null, "numero invalido");
                } else{
                    JOptionPane.showMessageDialog(null, "numero escolhido: " + num);
                    break;
                }
            }
            
            Random randomnum = new Random();
            int tentativas = 0;
            
            while(true){
            int resultado = randomnum.nextInt(99);
            tentativas = tentativas + 1;
            if(resultado == num){
                JOptionPane.showMessageDialog(null, "numero acertado com " + tentativas + "tentativa(s) | " + resultado);
            break;
            }else{
                JOptionPane.showMessageDialog(null, tentativas + " tentativa(s) | " +resultado);
            }
            
            }
            
            
    }
}
