public class ListasDuplamenteLigadasCirculares {
    private No inicio;

    public ListasDuplamenteLigadasCirculares() {
        this.inicio = null;
    }

    public void inserirInicio(int x){
        if(this.inicio == null){
            this.inicio = new No(x);
            return;
        }
        No novo = new No(x);
        if(inicio.prox == null){
            inicio.ant = novo;
            inicio.prox = novo;
            novo.prox = inicio;
            novo.ant = inicio;
            inicio = novo;
            return;
        }

        No ant = inicio.ant;
        ant.prox = novo;
        novo.ant = ant;
        novo.prox = inicio;
        inicio = novo;
    }

    public void inserirFinal(int x){
        if(this.inicio == null){
            this.inicio = new No(x);
            return;
        }
        No novo = new No(x);
        if(inicio.prox == null){
            inicio.ant = novo;
            inicio.prox = novo;
            novo.prox = inicio;
            novo.ant = inicio;
            return;
        }
        No ant = inicio.ant;
        ant.prox = novo;
        novo.ant = ant;
        novo.prox = inicio;
        inicio.ant = novo;
    }

    public void inserirOrdenado(int x){
        if(this.inicio == null){
            this.inicio = new No(x);
            return;
        }
        No novo = new No(x);
        if(inicio.prox == null){
            if(inicio.valor >= x){
                inicio.ant = novo;
                inicio.prox = novo;
                novo.prox = inicio;
                novo.ant = inicio;
                inicio = novo;
                return;
            }
            inicio.ant = novo;
            inicio.prox = novo;
            novo.prox = inicio;
            novo.ant = inicio;
            return;
        }

        No temp = inicio;

        if(x <= temp.valor){
            No ant = inicio.ant;
            inicio.ant = novo;
            ant.prox = novo;
            novo.ant = ant;
            novo.prox = inicio;
            inicio = novo;
            return;
        }

        while(temp.prox != inicio){
            if(x <= temp.prox.valor){
                novo.ant = temp.prox.ant;
                novo.prox = temp.prox;
                temp.prox = novo;
                return;
            }
            temp = temp.prox;
        }
        No ant = inicio.ant;
        ant.prox = novo;
        novo.ant = ant;
        novo.prox = inicio;
        inicio.ant = novo;
    }

    public void remover(int x) {
        // 1. Se a lista estiver vazia, não há o que remover
        if (this.inicio == null) {
            return;
        }

        No temp = inicio;

        // Usamos do-while para garantir que o último elemento também seja verificado
        do {
            if (temp.valor == x) {

                // CASO A: A lista tem apenas UM elemento e ele é o alvo
                if (temp.prox == temp) {
                    this.inicio = null;
                }
                // CASO B: A lista tem mais de um elemento
                else {
                    // Desconecta o nó atual (temp), ligando o anterior direto ao próximo
                    temp.ant.prox = temp.prox;
                    temp.prox.ant = temp.ant;

                    // Se o nó removido for o primeiro da lista, atualizamos a cabeça (inicio)
                    if (temp == inicio) {
                        this.inicio = temp.prox;
                    }
                }
                return; // Elemento encontrado e removido, encerra o método
            }

            // Avança para o próximo nó
            temp = temp.prox;

        } while (temp != inicio); // Para de procurar quando dermos a volta completa
    }

    public void removerInicio(){
        if(this.inicio == null){
            return;
        }
        No ant = inicio.ant;
        No prox = inicio.prox;
        ant.prox = inicio.prox;
        prox.ant = inicio.ant;
        inicio = inicio.prox;
    }

    public void removerFinal(){
        if(this.inicio == null){
            return;
        }
        No ant = inicio.ant;
        ant.ant.prox = inicio;
        inicio.ant = ant.ant;
    }

    public void exibir() {
        No temp = inicio;

        while(temp.prox != inicio){
            System.out.print(temp.valor + " ");
            temp = temp.prox;
        }
        System.out.println(temp.valor);
    }

    public void exibirInverso() {
        No temp = inicio.ant;



        while(temp != inicio){
            System.out.print(temp.valor + " ");
            temp = temp.ant;
        }
        System.out.println(temp.valor);
    }
}
