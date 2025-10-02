
package exerciciosfixacao4.numeroum;


public class numeroum{
    public static void main(String[] args) {
        Funcionarios meufuncionario = new Funcionarios("tulio", 1000);
        meufuncionario.addAumento(500);
        meufuncionario.exibeDados();
        
        Assistentes meuassistente = new Assistentes("assistentetulio", 1000, 12345);
        meuassistente.exibeDados();
        
        Tecnicos meutecnico = new Tecnicos("tecnicotulio", 1000, 67891, 200);
        meutecnico.exibeDados();
        
        Administrativos meuadministrativo = new Administrativos("administrativotulio", 1000, 23456, "noturno", 150);
        meuadministrativo.exibeDados();
    }
}

    
