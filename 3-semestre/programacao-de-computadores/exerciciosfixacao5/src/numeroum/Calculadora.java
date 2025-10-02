package numeroum;

public abstract class Calculadora {
    protected double num;    

    public Calculadora(double num) {
        this.num = num;
    }
   
    public void soma(double num2){
        num = num+num2;
        System.out.println(num);
    }
    public void subtracao(double num2){
        num = num-num2;
        System.out.println(num);
    }
    public void multiplicacao(double num2){
        num = num*num2;
        System.out.println(num);
    }
    public void divisao(double num2){
        num = num/num2;
        System.out.println(num);
    }
}
