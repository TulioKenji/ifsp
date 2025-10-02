package numerodois;

public class numerodois {
    public static void main(String[] args) {
        Agenda myagenda = new Agenda(10);
        myagenda.adicionarContatos(new PessoaFisica("tulio", "tulio@gmail", "rua 3",  654321, "10/08/2004", "solteiro"));
        myagenda.adicionarContatos(new PessoaJuridica("empresa", "@empresa", "rua 5", 1234, "taescrito", "semrazao"));
        myagenda.adicionarContatos(new PessoaJuridica("empresa2", "@empresa", "rua 5", 8901, "taescrito", "semrazao"));
        myagenda.adicionarContatos(new PessoaJuridica("empresa3", "@empresa", "rua 5", 4563, "taescrito", "semrazao"));
        myagenda.adicionarContatos(new PessoaFisica("kenji", "tulio@gmail", "rua 3",  123456, "10/08/2004", "solteiro"));


        myagenda.visualizarContatos();
        myagenda.ordenarContatos();
        System.out.println("ordenado");
        myagenda.visualizarContatos();
    }
}
