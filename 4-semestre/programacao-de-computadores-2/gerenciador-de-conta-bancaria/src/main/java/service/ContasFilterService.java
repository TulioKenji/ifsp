package service;


import model.ContaCorrente;
import org.springframework.stereotype.Repository;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Predicate;
import java.util.stream.Collectors;

@Repository
public class ContasFilterService {




    public List<ContaCorrente> contasComSaldoMaiorQueMil(String caminho) throws IOException {
        ContasService contasService = new ContasService();
        ArrayList<ContaCorrente> contas = contasService.lerContas(caminho);
        List<ContaCorrente> filter = contas.stream().filter(conta -> conta.getSaldo() > 1000).toList();
        return filter;
    }

    public double saldoTotal(String caminho) throws IOException {
        ContasService contasService = new ContasService();
        ArrayList<ContaCorrente> contas = contasService.lerContas(caminho);
        double total = contas.stream().map(ContaCorrente::getSaldo).reduce(0.0,(a,b) -> a+b);
        return total;
    }

    public Map<String, List<ContaCorrente>> agruparPorFaixaDeSaldo(String caminho) throws IOException {
        ContasService contasService = new ContasService();
        ArrayList<ContaCorrente> contas = contasService.lerContas(caminho);
        Map<String, List<ContaCorrente>> group = contas.stream().collect(
                Collectors.groupingBy(
                        contaCorrente -> {
                            double saldo = contaCorrente.getSaldo();
                            if (saldo <= 5000) return "a";
                            else if (saldo > 5000 && saldo<=10000) return "b";
                            else return "c";
                        }
                )
        );
        return group;
    }

    public List<ContaCorrente> contasComSaldoMaiorQueCincoMil(String caminho) throws IOException {
        Predicate<ContaCorrente> maiorQueCincoMil = contaCorrente -> contaCorrente.getSaldo() > 5000;

        ContasService contasService = new ContasService();
        ArrayList<ContaCorrente> contas = contasService.lerContas(caminho);

        List<ContaCorrente> filterCincoMil = contas.stream().filter(maiorQueCincoMil).toList();

        return filterCincoMil;

    }

    public List<ContaCorrente> contasComNumeroPar(String caminho) throws IOException {
        Predicate<ContaCorrente> contaNumeroPar = contaCorrente -> (contaCorrente.getNumero()%2) == 0;

        ContasService contasService = new ContasService();
        ArrayList<ContaCorrente> contas = contasService.lerContas(caminho);

        List<ContaCorrente> filterPar = contas.stream().filter(contaNumeroPar).toList();

        return filterPar;
    }

    public List<ContaCorrente> ordenarListaDeContas(String caminho) throws IOException {
        ContasService contasService = new ContasService();
        ArrayList<ContaCorrente> contas = contasService.lerContas(caminho);
        Comparator<ContaCorrente> ordenarContas = Comparator.comparing(ContaCorrente::getSaldo).reversed()
                                                    .thenComparing(ContaCorrente::getTitular);

        List<ContaCorrente> contasOrdenadas = contas.stream().sorted(ordenarContas).toList();
        return contasOrdenadas;
    }
}
