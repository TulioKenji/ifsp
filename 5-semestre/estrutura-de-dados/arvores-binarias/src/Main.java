public static NoA raiz = null;
public static ArrayList<NoA> nolist = new ArrayList<NoA>();


void main() {
    inserir(11);
    inserir(8);
    inserir(37);
    inserir(9);
    inserir(7);
    inserir(18);
    inserir(42);
    inserir(50);
    inserir(51);
    inserir(2);
    exibir();
    System.out.println();
    System.out.println(menor(raiz));
    System.out.println();
    System.out.println(maior(raiz));
    System.out.println();
    exibeFolhas(raiz);
    System.out.println();
    System.out.println(profundidade(raiz));
    System.out.println();
    System.out.println(tamanho(raiz));
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

