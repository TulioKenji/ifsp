package numerodois;

public interface IProdutoFabricado extends IProduto {
    int getNumeroDeIngredientes();
    IProduto getIngrediente(int numero);
}
