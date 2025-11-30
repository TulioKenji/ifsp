import java.util.Date;

public class Pessoa {
    String nome;
    String endereco;
    String cpf;
    int idade;
    double altura;
    String dataNascimento;

    public Pessoa(String nome, String endereco, String cpf, int idade, double altura, String dataNascimento) {
        this.nome = nome;
        this.endereco = endereco;
        this.cpf = cpf;
        this.idade = idade;
        this.altura = altura;
        this.dataNascimento = dataNascimento;
    }

    public Pessoa (){}

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEndereco() {
        return endereco;
    }

    public void setEndereco(String endereco) {
        this.endereco = endereco;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public int getIdade() {
        return idade;
    }

    public void setIdade(int idade) {
        this.idade = idade;
    }

    public double getAltura() {
        return altura;
    }

    public void setAltura(double altura) {
        this.altura = altura;
    }

    public String getDataNascimento() {
        return dataNascimento;
    }

    public void setDataNascimento(String dataNascimento) {
        this.dataNascimento = dataNascimento;
    }

    @Override
    public String toString() {

        return nome + ";" + endereco + ";" + cpf + ";" + idade + ";" + altura + ";" + dataNascimento;
    }
}
