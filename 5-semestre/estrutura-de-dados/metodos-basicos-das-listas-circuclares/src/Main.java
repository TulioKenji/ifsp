void main() {
//    var f = new FilaCircular();
//    f.insereInicio(1);
//    f.insereInicio(2);
//    f.insereInicio(3);
//    f.insereInicio(4);
//    f.insereInicio(5);
//    f.insereInicio(6);
//    f.insereInicio(7);
//    f.insereInicio(8);
//    f.insereInicio(9);
//    f.insereInicio(10);
//    f.exibir();

//    var g = new FilaCircular();
//    g.insereFinal(1);
//    g.insereFinal(2);
//    g.insereFinal(3);
//    g.insereFinal(4);
//    g.insereFinal(5);
//    g.insereFinal(6);
//    g.insereFinal(7);
//    g.insereFinal(8);
//    g.insereFinal(9);
//    g.insereFinal(10);
//    g.exibir();
//    System.out.println("remover inicio");
//    g.removeInicio();
//    g.removeInicio();
//    g.exibir();
//    System.out.println("remover final");
//    g.removeFinal();
//    g.removeFinal();
//    g.exibir();
//    System.out.println("teste");
//    g.removeFinal();
//    g.removeFinal();
//    g.removeFinal();
//    g.removeFinal();
//    g.removeFinal();
//    g.removeFinal();
//    g.removeFinal();
//    g.removeFinal();
//    g.removeFinal();
//    g.removeFinal();
//    g.removeFinal();
//    g.removeFinal();
//    g.removeFinal();
//    g.removeFinal();
//    g.exibir();
    int[]vet = new int[6];
    for(int i = 0; i<vet.length; i++){
        vet[i]=i+1;
    }


    var j  = new FilaCircular(vet);
    j.josephus(3);
    j.exibir();

}
