package exerciciosfixacao3;


public class numerotres {
    public static void main(String[] args) {
        Contabancaria myaccount = new Contabancaria(123456, 30);
        myaccount.extrato();
        myaccount.saque(10);
        myaccount.deposito(80);
    }
}

class Contabancaria {
    private int numeroDaConta;
    private double saldo;

    public Contabancaria(int numeroDaConta, double saldo) {
        this.numeroDaConta = numeroDaConta;
        this.saldo = saldo;
    }

    public int getNumeroDaConta() {
        return numeroDaConta;
    }

    public double getSaldo() {
        return saldo;
    }

    public void setNumeroDaConta(int numeroDaConta) {
        this.numeroDaConta = numeroDaConta;
    }

    public void setSaldo(double saldo) {
        this.saldo = saldo;
    }
    
    public void extrato(){
        System.out.println("conta: " + numeroDaConta + " saldo: R$ " + saldo);
    }
    
    public void saque(double valor){
        if(valor > saldo){
            System.out.println("Erro: saldo insuficiente");
            extrato();
        }else{
            System.out.println("saque bem sucedido");
            saldo-=valor;
            extrato();
            
        }
    }
    
    public void deposito(double valor){
        saldo += valor;
        System.out.println("deposito bem sucedido");
        extrato();
    }
}
