package exerciciosfixacao3;

import java.util.Scanner;

public class numeroum {
    public static void main(String[] args) {
        Aluno aluno = new Aluno();
        Scanner myscanner = new Scanner(System.in);
        System.out.println("digite o nome");
        aluno.setNome(myscanner.nextLine()); 
        System.out.println("Digite a matricula");
        aluno.setMatricula(myscanner.nextLine());
        System.out.println("digite a nota 1");
        aluno.setNota1(myscanner.nextDouble());
        System.out.println("digite a nota 2");
        aluno.setNota2(myscanner.nextDouble());
        System.out.println("digite a nota do trabalho");
        aluno.setNotatrabalho(myscanner.nextDouble());
        
        double media = aluno.Media(aluno.getNota1(), aluno.getNota2(), aluno.getNotatrabalho());
        System.out.println("media: " + media);
        boolean rec = aluno.Rec(media);
        if(rec){
            System.out.println("não esta de recuperação");
        } else{
            System.out.println("esta de recuperaçãos");
        }
    }        
}

class Aluno{
    private String matricula;
    private String nome;
    private double nota1;  
    private double nota2;
    private double notatrabalho;

    public void setMatricula(String matricula) {
        this.matricula = matricula;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public void setNota1(double nota1) {
        this.nota1 = nota1;
    }

    public void setNota2(double nota2) {
        this.nota2 = nota2;
    }

    public void setNotatrabalho(double notatrabalho) {
        this.notatrabalho = notatrabalho;
    }

    public String getMatricula() {
        return matricula;
    }

    public String getNome() {
        return nome;
    }

    public double getNota1() {
        return nota1;
    }

    public double getNota2() {
        return nota2;
    }

    public double getNotatrabalho() {
        return notatrabalho;
    }
    
//
    
    public static double Media(double n1, double n2, double nt){
        return (n1+n2+nt)/3;
    }
    
    public static boolean Rec(double media){
        if(media >= 6){
        return true;
        }
        return false;
    }
}