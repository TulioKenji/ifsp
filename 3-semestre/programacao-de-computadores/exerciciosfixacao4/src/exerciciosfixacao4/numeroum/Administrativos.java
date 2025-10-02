package exerciciosfixacao4.numeroum;

public class Administrativos extends Assistentes {
    private String turno;
    private double adicional;

    public Administrativos(String nome, double salario, int matricula,String turno, double adicional) {
        super(nome, salario, matricula);
        this.turno = turno;
        this.adicional = adicional;
    }
    
    @Override
    public double ganhoAnual(){
    return (salario+adicional)*12;
    }
    
}
