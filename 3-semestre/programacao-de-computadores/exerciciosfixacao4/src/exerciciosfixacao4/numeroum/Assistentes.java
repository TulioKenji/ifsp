package exerciciosfixacao4.numeroum;


public class Assistentes extends Funcionarios {
    private int matricula;

    public Assistentes(String nome, double salario, int matricula) {
        super(nome, salario);
        this.matricula = matricula;
    }
    
    

    public int getMatricula() {
        return matricula;
    }

    public void setMatricula(int matricula) {
        this.matricula = matricula;
    }
    
    @Override
    public void exibeDados(){
        System.out.println("nome: "+nome);
        System.out.println("salario: "+salario);
        System.out.println("ganho anual: "+ganhoAnual());
        System.out.println("matricula: "+matricula);
    }
}
