package exerciciosfixacao3;

import java.util.Scanner;

public class numerodois {
    public static void main(String[] args) {
        Funcionarios funcionario = new Funcionarios();
        Scanner myscanner = new Scanner(System.in);
        
        System.out.println("digite o nome");
        funcionario.setNome(myscanner.nextLine());
        System.out.println("digite o departamento");
        funcionario.setDepartamento(myscanner.nextLine());
        System.out.println("digite o rg");
        funcionario.setRg(myscanner.nextLine());
        System.out.println("digite a data de entrada");
        funcionario.setDataentrada(myscanner.nextLine());
        System.out.println("digite o salario");
        funcionario.setSalario(myscanner.nextDouble());
        
        System.out.println("digite o aumento");
        double aumento = myscanner.nextDouble();
        funcionario.aumentoSalario(aumento);
        System.out.println("salario x 12: "+ funcionario.calculaGanhoAnual(funcionario.getSalario()));
    }
    
}

class Funcionarios{
    private String nome;
    private String departamento;
    private double salario;
    private String dataentrada;
    private String rg;

    public String getNome() {
        return nome;
    }

    public String getDepartamento() {
        return departamento;
    }

    public double getSalario() {
        return salario;
    }

    public String getDataentrada() {
        return dataentrada;
    }

    public String getRg() {
        return rg;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public void setDepartamento(String departamento) {
        this.departamento = departamento;
    }

    public void setSalario(double salario) {
        this.salario = salario;
    }

    public void setDataentrada(String dataentrada) {
        this.dataentrada = dataentrada;
    }

    public void setRg(String rg) {
        this.rg = rg;
    }
    
    //
    
    public void aumentoSalario(double aumento){
        System.out.println("novo salario: " +(salario+aumento));
        this.salario = salario + aumento;
    }
    
    public static double calculaGanhoAnual(double salario){
        return salario*12;
    }
}
