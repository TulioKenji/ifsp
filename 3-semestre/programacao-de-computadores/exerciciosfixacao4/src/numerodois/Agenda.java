package numerodois;

public class Agenda {
    private Contatos[] contatos;
    private int qtdContatos;

    public Agenda(int tamanho) {
        contatos = new Contatos[tamanho];
        qtdContatos = 0;
    }

    public void adicionarContatos(Contatos contato){
        if(qtdContatos<contatos.length){
            contatos[qtdContatos] = contato;
            qtdContatos++;
            System.out.println("contato adicionado com sucesso");
        }
        else{
            System.out.println("agenda cheia");
        }
    }

    public void removerContatos(String nome){
        for (int i = 0; i<qtdContatos; i++){
            if(contatos[i].getNome().equals(nome)){
                for (int j = i; j<(qtdContatos-1); j++){
                    contatos[j] = contatos[j+1];
                }
                contatos[qtdContatos-1] = null;
                qtdContatos--;
                break;
            }
        }
    }

    public void visualizarContatos() {
        for (int i = 0; i < qtdContatos; i++) {
            System.out.println(contatos[i]);
        }
    }

    public void visualizarPorNome(String nome){
        for (int i = 0; i<qtdContatos; i++){
            if(contatos[i].getNome().equals(nome)){
                System.out.printf(contatos[i].toString());
                break;
            }
        }
    }

    public void visualizarPorCpf(int num){
        for (int i = 0; i<qtdContatos; i++){
            if(contatos[i] instanceof PessoaFisica){
                PessoaFisica pf = (PessoaFisica)  contatos[i];
                if(pf.getCpf() == num){
                    System.out.println(pf.toString());
                }
            } else if(contatos[i] instanceof PessoaJuridica){
                PessoaJuridica pj = (PessoaJuridica) contatos[i];
                if(pj.getCnpj() == num){
                    System.out.println(pj.toString());
                }
            } else{
                System.out.println("contato não encontrado");
            }
        }
    }

    public void ordenarContatos(){
        for(int i = 0; i<qtdContatos; i++){
            for (int j = i; j<qtdContatos; j++){
                if((contatos[i] instanceof PessoaJuridica) && (contatos[j] instanceof PessoaFisica) ) {
                    Contatos temp = contatos[j];
                    contatos[j] = contatos[i];
                    contatos[i] = temp;
                    break;
                }
            }
        }

        for (int i = 0; i<qtdContatos; i++){
            for (int j = i; j<qtdContatos; j++){
                if( (contatos[i] instanceof PessoaFisica) && (contatos[j] instanceof PessoaFisica) ){
                    PessoaFisica pf1 = (PessoaFisica)  contatos[i];
                    PessoaFisica pf2 = (PessoaFisica)  contatos[j];
                    if( (pf1.getCpf()) > (pf2.getCpf()) ) {
                        Contatos temp = contatos[j];
                        contatos[j] = contatos[i];
                        contatos[i] = temp;

                    }
                }
                if(contatos[i] instanceof PessoaJuridica){
                    PessoaJuridica pj1 = (PessoaJuridica) contatos[i];
                    PessoaJuridica pj2 = (PessoaJuridica) contatos[j];
                    if( (pj1.getCnpj()) > (pj2.getCnpj()) )  {
                        Contatos temp = contatos[j];
                        contatos[j] = contatos[i];
                        contatos[i] = temp;

                    }
                }
            }
        }
    }

}
