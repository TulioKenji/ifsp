public static NoA raiz = null;

void main(){
    inserir(10);
    inserir(20);
    inserir(30);
    inserir(25);
    mostrarFB(raiz);
    System.out.println(fatorBalanceamento(raiz));
    exibeArvore(raiz,0);
    rodar(raiz,-1);
    exibeArvore(raiz, 0);
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
//    if(n == null){
//        return;
//    }
//    int count = ((n.esq != null && n.dir != null) || (n.esq == null && n.dir == null)) ? 0 : n.dir == null ? -1: 1;
//    System.out.println(n.valor + " -> FB = "+ count);
//    if(n.esq != null){
//        mostrarFB(n.esq);
//    }
//    if(n.dir != null){
//        mostrarFB(n.dir);
//    }
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