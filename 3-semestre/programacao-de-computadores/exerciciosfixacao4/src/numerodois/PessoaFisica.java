package numerodois;

public class PessoaFisica extends Contatos{
    private int cpf;
    private String dataDeNascimento;
    private String estadoCivil;

    public PessoaFisica(String nome, String email, String endereco, int cpf, String dataDeNascimento, String estadoCivil) {
        super(nome, email, endereco);
        this.cpf = cpf;
        this.dataDeNascimento = dataDeNascimento;
        this.estadoCivil = estadoCivil;
    }

    public int getCpf() {
        return cpf;
    }

    @Override
    public String toString() {
        return "Pessoa física - Nome: " + nome + " E-mail: " + email + " endereco: " + endereco + " cpf: " + cpf + " Data de nascimento: " + dataDeNascimento + " Estado civil: " + estadoCivil;
    }
}
