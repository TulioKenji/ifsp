package exerciciosfixacao2;

import javax.swing.JOptionPane;
import java.util.Random;

public class numerotres {
    public static void main(String[] args) {
        String[] ppt = {"pedra", "papel", "tesoura"};
        int escolha = JOptionPane.showOptionDialog(null, "Escolha:", "Pedra papel tesoura", 0,3, null, ppt,  ppt[0]);
        Random jogo = new Random();

        int random = jogo.nextInt();
        random = random%10;

        int escolhapc = 0;

        if((random <5) && (random >=0) ){
            escolhapc = 1;
        } else if(random >=5){
            escolhapc = 2;
        } else {
            escolhapc = 0;
        }
        System.out.println(random);
        if ( (escolha == 0) && (escolhapc ==0) ){
            JOptionPane.showMessageDialog(null, "computador: pedra | voce empatou!");
        }
        if ((escolha == 0) && (escolhapc ==1)){
            JOptionPane.showMessageDialog(null, "computador: papel | voce perdeu!");
        }
        if ((escolha == 0) && (escolhapc ==2)){
            JOptionPane.showMessageDialog(null, "computador: tesoura | voce ganhou!");
        }
        if ((escolha == 1) && (escolhapc ==0)){
            JOptionPane.showMessageDialog(null, "computador: pedra | voce ganhou!");
        }
        if ((escolha == 1) && (escolhapc ==1)){
            JOptionPane.showMessageDialog(null, "computador: papel | voce empatou!");
        }
        if ((escolha == 1) && (escolhapc ==2)){
            JOptionPane.showMessageDialog(null, "computador: tesoura | voce perdeu!");
        }
        if ((escolha == 2) && (escolhapc ==0)){
            JOptionPane.showMessageDialog(null, "computador: pedra | voce perdeu!");
        }
        if ((escolha == 2) && (escolhapc ==1)){
            JOptionPane.showMessageDialog(null, "computador: papel | voce ganhou!");
        }
        if ((escolha == 2) && (escolhapc ==2)){
            JOptionPane.showMessageDialog(null, "computador: tesoura | voce empatou!");
        }
    }

}
