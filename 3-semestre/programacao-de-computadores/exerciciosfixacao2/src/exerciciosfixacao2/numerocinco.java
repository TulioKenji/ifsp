package exerciciosfixacao2;

import javax.swing.JOptionPane;

public class numerocinco {
    public static void main(String[] args) {
        String senha = new String();
        while(true){
        senha = JOptionPane.showInputDialog("digite a senha");
        boolean resultado = verifica(senha);
        if(resultado == true){
            JOptionPane.showMessageDialog(null, "senha valida: " + senha);
            break;
        } else{
            JOptionPane.showMessageDialog(null, "senha invalida");
        }
        
        }
    }
    
    public static boolean verifica(String x){
        int tamanho = x.length();

        if(tamanho <8){
            JOptionPane.showMessageDialog(null, "menos de 8 caracteres");
            return false;
        }
        
        int a = 65;
        int i = 0;
        int count = 0;
        while(count <1){
            char letra = (char) a;
                if(x.charAt(i) == letra){
                    count++;
                }
           a++;
           if(letra >= 'Z'){
               i++;
               a = 65;
           }
            if(i>(tamanho-1)){
                JOptionPane.showMessageDialog(null, "sem letras maiusculas");
                return false;
            }

        }
        
        int b = 97;
        int ii = 0;
        int countm = 0;
        while(countm <1){
            char letra = (char) b;
                if(x.charAt(ii) == letra){
                    countm++;
                }
           b++;
           if(letra >= 'z'){
               ii++;
               b = 97;
           }
            if(ii>(tamanho-1)){
                JOptionPane.showMessageDialog(null, "sem letras minusculas");
                return false;
            }

        }
        
        int c = 48;
        int iii = 0;
        int countn = 0;
        while(countn <1){
            char letra = (char) c;
                if(x.charAt(iii) == letra){
                    countn++;
                }
           c++;
           if(c >= 57){
               iii++;
               c = 0;
           }
            if(iii>(tamanho-1)){
                JOptionPane.showMessageDialog(null, "sem numeros");
                return false;
            }

        }
        
        int d = 32;
        int iv = 0;
        int counte = 0;

        while(counte <1){
            char letra = (char) d;
                if(x.charAt(iv) == letra){
                    counte++;
                }
           d++;
           if(letra >= 47){
               iv++;
               d = 32;
           }
            if(iv>(tamanho-1)){

                break;
            }

        }
        int e = 58;
        int v = 0;
        while(counte <1){
            char letra = (char) e;
                if(x.charAt(v) == letra){
                    counte++;
                }
           e++;
           if(letra >= 64){
               v++;
               e = 58;
           }
            if(v>(tamanho-1)){
                JOptionPane.showMessageDialog(null, "sem caracteres especiais");
                return false;
            }

        }
        return true;
       
    }
    
}
