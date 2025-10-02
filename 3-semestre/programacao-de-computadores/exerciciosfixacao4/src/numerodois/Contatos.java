package numerodois;

public class Contatos {
    protected String nome;
    protected String email;
    protected String endereco;

    public Contatos(String nome, String email, String endereco) {
        this.nome = nome;
        this.email = email;
        this.endereco = endereco;
    }

    public String getNome(){
        return nome;
    }

}
