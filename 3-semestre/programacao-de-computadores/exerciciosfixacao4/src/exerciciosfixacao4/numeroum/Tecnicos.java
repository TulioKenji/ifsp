package exerciciosfixacao4.numeroum;


public class Tecnicos extends Assistentes {
    private double bonus;
    public Tecnicos(String nome, double salario, int matricula, double bonus) {
        super(nome, salario, matricula);
        this.bonus = bonus;
    }

    public void setBonus(double bonus) {
        this.bonus = bonus;
    }

    public double getBonus() {
        return bonus;
    }
    
    @Override
    public double ganhoAnual(){
    return (salario+bonus)*12;
    }
    
    
}
