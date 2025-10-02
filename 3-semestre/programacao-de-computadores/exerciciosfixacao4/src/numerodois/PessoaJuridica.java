package numerodois;

public class PessoaJuridica extends Contatos{
    private int cnpj;
    private String escricaoEstadual;
    private String razaoSocial;

    public PessoaJuridica(String nome, String email, String endereco, int cnpj, String escricaoEstadual, String razaoSocial) {
        super(nome, email, endereco);
        this.cnpj = cnpj;
        this.escricaoEstadual = escricaoEstadual;
        this.razaoSocial = razaoSocial;
    }

    public int getCnpj() {
        return cnpj;
    }

    @Override
    public String toString(){
        return "Pessoa jurídica - Nome: " + nome + " E-mail: " + email + " endereco: " + endereco + " CNPJ: " + cnpj + " Escrição Estadual: " + escricaoEstadual + " Razão social: " + razaoSocial;
    }
}
