package numerotres;

public class Conta {
    private double saldo;
    
    public void sacar(double valor){
        saldo-=valor;
    }
    
    public void depositar(double valor){
        saldo+=valor;
    }

    public double getSaldo() {
        return saldo;
    }
    
    
}
