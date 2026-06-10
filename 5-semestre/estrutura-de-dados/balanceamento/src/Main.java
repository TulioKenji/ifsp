public static NoA raiz = null;

void main(){
    var arr = Valores.retornar();
    for(int i : arr){
        insereExclusivo(i);
    }
//    System.out.println("Quantos elementos foram inseridos ? " + tamanho(raiz));
//    System.out.println("Qual a profundidade da árvore ? " + profundidade(raiz));
//    System.out.println("Qual a profundidade da sub-árvore da esquerda em relação à raiz ? " + profundidade(raiz.esq));
//    System.out.println("Qual a profundidade da sub-árvore da direita em relação à raiz ? " + profundidade(raiz.dir));
//    System.out.println("Após duas operações de giro à esquerda sobre o nó raiz:");
//    raiz = girarEsquerda(raiz);
//    raiz = girarEsquerda(raiz);
//    System.out.println("Qual a profundidade da sub-árvore da esquerda em relação à raiz ? " + profundidade(raiz.esq));
//    System.out.println("Qual a profundidade da sub-árvore da direita em relação à raiz ? " + profundidade(raiz.dir));
//    System.out.println("Remova da árvore todos os números múltiplos de 3, 5 e 7, após a remoção");
////    System.out.println("&&");
////    for(int i: arr){
////        if( (i%3==0) && (i%5==0) && (i%7==0) ){
////            if(existe(i)){
////                remover(i);
////            }
////        }
////    }
////    System.out.println("Qual a profundidade da árvore ? " + profundidade(raiz));
////    System.out.println("Qual a profundidade da sub-árvore da esquerda em relação à raiz ? " + profundidade(raiz.esq));
////    System.out.println("Qual a profundidade da sub-árvore da direita em relação à raiz ? " + profundidade(raiz.dir));
//    System.out.println("||");
//    for(int i: arr){
//        if( (i%3==0) || (i%5==0) || (i%7==0) ){
//            if(existe(i)){
//                remover(i);
//            }
//        }
//    }
//    System.out.println("Qual a profundidade da árvore ? " + profundidade(raiz));
//    System.out.println("Qual a profundidade da sub-árvore da esquerda em relação à raiz ? " + profundidade(raiz.esq));
//    System.out.println("Qual a profundidade da sub-árvore da direita em relação à raiz ? " + profundidade(raiz.dir));

    while(!ehAVL(raiz)){
        raiz = balancear(raiz);
    }

}

public static void inserir(int n){
    NoA novo = new NoA(n);
    if(raiz == null){
        raiz = novo;
        return;
    }
    NoA temp = raiz;
    while(true){
        if(temp.valor <= novo.valor){
            if(temp.dir == null){
                temp.dir = novo;
                break;
            }
            temp = temp.dir;
            continue;
        }
        if(temp.esq == null){
            temp.esq = novo;
            break;
        }
        temp = temp.esq;
    }
}

public static void insereExclusivo(int x){
    NoA novo = new NoA(x);
    if(raiz == null){
        raiz = novo;
        return;
    }
    NoA temp = raiz;
    while(true){
        if(temp.valor < novo.valor){
            if(temp.dir == null){
                temp.dir = novo;
                break;
            }
//            if(temp.dir.valor == novo.valor){
//                break;
//            }
            temp = temp.dir;
            continue;
        }
        if(temp.valor > novo.valor){
            if(temp.esq == null){
                temp.esq = novo;
                break;
            }
//            if(temp.esq.valor == novo.valor){
//                break;
//            }
            temp = temp.esq;
            continue;
        }
        break;
    }
}

private static int tamanho(NoA temp) {
    if(temp != null)
        return 1+tamanho(temp.esq)+tamanho(temp.dir);

    return 0;
}

static void exibeArvore(NoA n, int x){
    if(raiz == null){
        System.out.println("vazio");
        return;
    }

    if(n.dir != null)
        exibeArvore(n.dir, x+1);
    else
        System.out.println();

    for(int i=1; i<=x; i++)
        System.out.print("|  ");

    if((n.esq == null)&&(n.dir == null))
        System.out.print("["+n.valor+"]");
    else
        System.out.print(n.valor);

    if(n.esq != null)
        exibeArvore(n.esq, x+1);
    else
        System.out.println();

}

public static int profundidade(NoA temp){
    if(temp == null){
        return -1;
    }
    if((temp.esq == null && temp.dir == null)){
        return 0;
    }
    if(temp.esq != null && temp.dir == null){
        return profundidade(temp.esq)+1;
    }
    profundidade(temp.esq);
    return profundidade(temp.dir)+1;
}

public static void mostrarFB(NoA n){
    if(n != null){
        System.out.println(n.valor + " -> FB = " + (profundidade(n.dir) - profundidade(n.esq)));
        mostrarFB(n.esq);
        mostrarFB(n.dir);
    }
}

public static boolean ehAVL(NoA n){
    if(n == null){
        return true;
    }
    int res = (profundidade(n.dir) - profundidade(n.esq));
    return res <=1 && res >=-1;
}

public static int fatorBalanceamento(NoA n){
    if(n == null){
        return -1;
    }
    return (profundidade(n.dir) - profundidade(n.esq));
}

public static void rodar(NoA x, int direcao){
    if(x != raiz){
        x = direcao == -1 ? x = x.dir : x.esq;
    }

    if(direcao == -1){
        raiz = girarEsquerda(x);
    }else{
        raiz = girarDireita(x);
    }
}

public static NoA girarDireita(NoA x){
    NoA y = x.esq; //Seja Y o filho à esquerda de X
    x.esq = y.dir; // Torne o filho à direita de Y o filho à esquerda de X.
    y.dir = x; // Torne X o filho à direita de Y
    return y;
}

public static NoA girarEsquerda(NoA x){
    NoA y = x.dir; //Seja Y o filho à direita de X
    x.dir = y.esq; // Torne o filho à esquerda de Y o filho à direita de X.
    y.esq = x; // Torne X o filho à esquerda de Y
    return y;
}

//public static NoA balancear(NoA n) {
//    if (n == null) {
//        return null;
//    }
//
//    n.esq = balancear(n.esq);
//    n.dir = balancear(n.dir);
//
//    int fb = fatorBalanceamento(n);
//
//    if (fb > 1) {
//        // Verifica o filho da esquerda para saber se é Rotação Simples ou Dupla
//        if (fatorBalanceamento(n.esq) < 0) {
//            // Rotação Dupla: Esquerda-Direita (O "joelho" está para dentro)
//            // Gira o filho para a esquerda primeiro...
//            n.esq = girarEsquerda(n.esq);
//        }
//        // ... e depois gira o nó atual para a direita (Rotação Simples)
//        return girarDireita(n);
//    }
//
//    // CASO B: Desbalanceado para a DIREITA (FB < -1)
//    if (fb < -1) {
//        // Verifica o filho da direita para saber se é Rotação Simples ou Dupla
//        if (fatorBalanceamento(n.dir) > 0) {
//            // Rotação Dupla: Direita-Esquerda (O "joelho" está para dentro)
//            // Gira o filho para a direita primeiro...
//            n.dir = girarDireita(n.dir);
//        }
//        // ... e depois gira o nó atual para a esquerda (Rotação Simples)
//        return girarEsquerda(n);
//    }
//
//    return n;
//}

public static NoA balancear(NoA n) {
    if (n == null) {
        return null;
    }

    // 1. Percorre a árvore em Pós-Ordem (de baixo para cima)
    n.esq = balancear(n.esq);
    n.dir = balancear(n.dir);

    // 2. Calcula as profundidades REAIS do nó atual (Blindagem contra NPE)
    int profEsq = profundidade(n.esq);
    int profDir = profundidade(n.dir);
    int fb = profEsq - profDir; // Positivo: Peso na Esquerda | Negativo: Peso na Direita

    // CASO A: Desbalanceado para a ESQUERDA
    if (fb > 1) {
        // Pega a profundidade dos netos da esquerda com segurança
        int profEsqEsq = profundidade(n.esq != null ? n.esq.esq : null);
        int profEsqDir = profundidade(n.esq != null ? n.esq.dir : null);

        if (profEsqEsq < profEsqDir) {
            // "Joelho" para a direita: Rotação Dupla
            n.esq = girarEsquerda(n.esq);
        }
        return girarDireita(n);
    }

    // CASO B: Desbalanceado para a DIREITA
    if (fb < -1) {
        // Pega a profundidade dos netos da direita com segurança
        int profDirEsq = profundidade(n.dir != null ? n.dir.esq : null);
        int profDirDir = profundidade(n.dir != null ? n.dir.dir : null);

        if (profDirEsq > profDirDir) {
            // "Joelho" para a esquerda: Rotação Dupla
            n.dir = girarDireita(n.dir);
        }
        return girarEsquerda(n);
    }

    // Se o FB está entre -1 e 1, devolve o nó em paz
    return n;
}

static void remover(int x){
    if(raiz.valor == x){
        if((raiz.esq == null) && (raiz.dir==null))
            raiz = null;
        else
        if((raiz.esq != null) && (raiz.dir != null))
            removeDoisFilhos(raiz,x);
        else
        if(raiz.esq == null)
            raiz = raiz.dir;
        else
            raiz = raiz.esq;
    }else
        removeNo(raiz, x);
}

static void removeNo(NoA n, int x){

    int f = contaFilhos(n,x);

    switch(f){
        case -1: System.out.println("O nó não existe na árvore"); break;
        case  0: removeFolha(n,x); break;
        case  1: removeUmFilho(n,x); break;
        case  2: removeDoisFilhos(n,x); break;
    }
}

static int contaFilhos(NoA n, int x){
    int nro_filhos = 0;

    if(n.valor == x){
        if(n.esq != null)
            nro_filhos++;
        if(n.dir != null)
            nro_filhos++;
    }else{

        if(x < n.valor)
            if(n.esq != null)
                nro_filhos+=contaFilhos(n.esq,x);
            else
                return -1;

        if(x > n.valor)
            if(n.dir != null)
                nro_filhos+=contaFilhos(n.dir,x);
            else
                return -1;
    }
    return nro_filhos;
}

static void removeFolha(NoA n, int x) {

    if(n.esq != null){
        if (n.esq.valor == x) {
            n.esq = null;
        }else{
            if(n.valor > x){
                removeFolha(n.esq, x);
            }
        }
    }

    if(n.dir != null){
        if (n.dir.valor == x) {
            n.dir = null;
        }else{
            if(n.valor < x){
                removeFolha(n.dir, x);
            }
        }
    }
}

static void removeUmFilho(NoA n, int x) {
    boolean removeu = false;

    if (n.esq != null) {
        if (n.esq.valor == x) {
            removeu = true;
            if (n.esq.esq != null) {
                n.esq = n.esq.esq;
            } else if (n.esq.dir != null) {
                n.esq = n.esq.dir;
            }
        }
    }

    if (n.dir != null) {
        if (n.dir.valor == x) {
            removeu = true;
            if (n.dir.esq != null) {
                n.dir = n.dir.esq;
            } else if (n.dir.dir != null) {
                n.dir = n.dir.dir;
            }
        }

    }

    if (!removeu) {
        if (x < n.valor) {
            removeUmFilho(n.esq, x);
        } else {
            removeUmFilho(n.dir, x);
        }
    }
}

static void removeDoisFilhos(NoA n, int x){
    if(n.valor == x){

        NoA tmp = noMaisAEsquerda(n.dir);

        // ISSO SERVE PARA RESOLVER O PROBLEMA DO N.DIR SER O NUMERO A SER REMOVIDO
        int novovalor = tmp.valor;
        // ESTA SENDO PASSADO POR PARAMETRO O VALOR DE N (PAI DE N.DIR)
        removeNo(n,tmp.valor);
        n.valor = novovalor;

    } else{
        if(x<n.valor)
            removeDoisFilhos(n.esq, x);
        else
            removeDoisFilhos(n.dir, x);
    }
}

static NoA noMaisAEsquerda(NoA n){
    NoA retorno = null;
    if(n.esq!=null){

        retorno = noMaisAEsquerda(n.esq);
    }
    else
        retorno = n;

    return retorno;

}

public static boolean existe(int x){
    NoA temp = raiz;

    while(temp!=null){
        if(temp.valor == x)
            return true;
        else{
            if(temp.valor <= x)
                temp = temp.dir;
            else
                temp = temp.esq;
        }
    }
    return false;
}