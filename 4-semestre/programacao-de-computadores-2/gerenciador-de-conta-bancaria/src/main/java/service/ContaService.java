package service;

import exception.SaldoInsuficienteException;
import model.ContaCorrente;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;

public class ContaService {
    public ContaCorrente lerConta(String caminho) throws IOException {
        List<String> linhas = Files.readAllLines(Paths.get(caminho));
        String[] dados = linhas.get(0).split(",");
        int numero = Integer.parseInt(dados[0].trim());
        String titular = dados[1].trim();
        double saldo = Double.parseDouble(dados[2].trim());
        return new ContaCorrente(numero, titular, saldo);
    }

    public void sacarValor(ContaCorrente conta, double valor) throws SaldoInsuficienteException {
        conta.sacar(valor);
    }

    public void atualizarConta(ContaCorrente conta, String caminho) throws IOException {
        String dados = conta.getNumero() + "," + conta.getTitular() + "," + conta.getSaldo();
        Files.write(Paths.get(caminho), dados.getBytes());
    }
}
