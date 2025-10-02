package exerciciosfixacao4.numeroum;

public class Funcionarios {
    String nome;
    protected double salario;

    public Funcionarios(String nome, double salario) {
        this.nome = nome;
        this.salario = salario;
    }
    
    

    public String getNome() {
        return nome;
    }

    public double getSalario() {
        return salario;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public void setSalario(double salario) {
        this.salario = salario;
    }
    
    public void addAumento(double valor){
        salario+=valor;
    }
    
    public double ganhoAnual(){
    return salario*12;
    }
    
    public void exibeDados(){
        System.out.println("nome: "+nome);
        System.out.println("salario: "+salario);
        System.out.println("ganho anual: "+ganhoAnual());
    }
}
