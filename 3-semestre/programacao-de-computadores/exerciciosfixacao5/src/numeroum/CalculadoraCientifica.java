package numeroum;

import java.lang.Math;

public class CalculadoraCientifica extends Calculadora{
    
    public CalculadoraCientifica(double num) {
        super(num);
    }
    
    public void potencia(double num2){
        num = Math.pow(num, num2);
        System.out.println(num);
    }
    
    public void raizquadrada(){
        num = Math.sqrt(num);
        System.out.println(num);
    }
}
