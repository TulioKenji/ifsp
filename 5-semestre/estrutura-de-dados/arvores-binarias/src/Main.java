public static NoA raiz = null;
public static ArrayList<NoA> nolist = new ArrayList<NoA>();


void main() {
//    inserir(11);
//    inserir(8);
//    inserir(37);
//    inserir(9);
//    inserir(7);
//    inserir(18);
//    inserir(42);
//    inserir(50);
//    inserir(51);
//    inserir(2);
//    exibir();
//    System.out.println();
//    System.out.println(menor(raiz));
//    System.out.println();
//    System.out.println(maior(raiz));
//    System.out.println();
//    exibeFolhas(raiz);
//    System.out.println();
//    System.out.println(profundidade(raiz));
//    System.out.println();
//    System.out.println(tamanho(raiz));

//    insereExclusivo(3);
//    insereExclusivo(2);
//    insereExclusivo(5);
//    insereExclusivo(1);
//    insereExclusivo(2);
//    insereExclusivo(2);
//    insereExclusivo(2);
//    insereExclusivo(23);
//    insereExclusivo(2);
//    insereExclusivo(2);
//    insereExclusivo(6);
//    insereExclusivo(7);
//    insereExclusivo(8);
//    insereExclusivo(6);
//    insereExclusivo(3);
//    insereExclusivo(2);
//    insereExclusivo(5);
//    insereExclusivo(1);
//    insereExclusivo(21);
//    insereExclusivo(2);
//    insereExclusivo(22);
//    insereExclusivo(2);
//    insereExclusivo(2);
//    insereExclusivo(2);
//    insereExclusivo(6);
//    insereExclusivo(7);
//    insereExclusivo(8);
//    insereExclusivo(6);

    inserir(3);
    inserir(2);
    inserir(20);

    System.out.println(contaFilhos(raiz,2));
    exibeArvore(raiz,0);
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

public static void exibir(){
    if(raiz == null){
        System.out.println("vazio");
        return;
    }
    append(raiz);

    while(!nolist.isEmpty()){
        System.out.println(nolist.getFirst().valor);
        nolist.removeFirst();
    }

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

public static void append(NoA temp){
    if(temp != null){
        nolist.add(temp);
        append(temp.esq);
        append(temp.dir);
    }
}

public static int menor(NoA temp){
    if(temp.esq != null){
        return menor(temp.esq);
    }
    return temp.valor;
}

public static int maior(NoA temp){
    if(temp.dir != null){
        return maior(temp.dir);
    }
    return temp.valor;
}

public static void exibeFolhas(NoA temp) {
    if (temp != null) {
        exibeFolhas(temp.esq);
        System.out.println(temp.valor);
        exibeFolhas(temp.dir);
    }
}

public static int profundidade(NoA temp){
    if(temp == null ||(temp.esq == null && temp.dir == null)){
        return 0;
    }
    if(temp.esq != null && temp.dir == null){
        return profundidade(temp.esq)+1;
    }
    profundidade(temp.esq);
    return profundidade(temp.dir)+1;
}

public static int tamanho(NoA temp){
    if(temp == null){
        return 1;

    }
    if(temp.esq != null && temp.dir == null){
        return tamanho(temp.esq)+1;
    }
    if(temp.dir != null && temp.esq == null){
        return tamanho(temp.dir)+1;
    }
    tamanho(temp.esq);
    return tamanho(temp.dir)+2;
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
            if(temp.dir.valor == novo.valor){
                break;
            }
            temp = temp.dir;
            continue;
        }
        if(temp.valor > novo.valor){
            if(temp.esq == null){
                temp.esq = novo;
                break;
            }
            if(temp.esq.valor == novo.valor){
                break;
            }
            temp = temp.esq;
            continue;
        }
        break;
    }
}

public static int contaFilhos(NoA n, int x){
    if(n == null){
        return -1;
    }
    if(x != n.valor){
        if(n.esq != null && n.dir == null){
            return contaFilhos(n.esq, x);
        }
        contaFilhos(n.dir,x);
        contaFilhos(n.esq,x);
        return 2;
    }
    if(n.valor == x){
        if(n.esq == null && n.dir == null){
            return 0;
        }
        if(n.esq == null || n.dir == null){
            return 1;
        }
        return 2;
    }

    return -1;

}

public static void remover(int x){
    if(raiz == null){
        return;
    }

    if(raiz.valor == x){

        if(raiz.esq == null && raiz.dir == null){
            raiz = null;
            return;
        }

        if(raiz.dir == null){
            raiz = raiz.esq;
            return;
        }

        if(raiz.esq == null){
            raiz = raiz.dir;
            return;
        }
        removeDoisFilhos(raiz,x);
    }
    removeNo(raiz, x);
}

public static void removeNo(NoA n, int x){
    int f = contaFilhos(n,x);

    switch(f){
        case -1: System.out.println("O nó não existe na árvore"); break;
        case  0: removeFolha(n,x); break;
        case  1: removeUmFilho(n,x); break;
        case  2: removeDoisFilhos(n,x); break;
    }
}

public static void removeFolha(NoA n, int x){

}

public static void removeUmFilho(NoA n, int x){

}

public static void removeDoisFilhos(NoA n, int x){

}