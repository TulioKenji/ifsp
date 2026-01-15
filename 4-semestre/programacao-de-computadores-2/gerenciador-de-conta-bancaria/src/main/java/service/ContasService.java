package service;

import exception.SaldoInsuficienteException;
import model.ContaCorrente;
import org.springframework.stereotype.Repository;
import strategy.TarifaStrategy;

import java.io.IOException;

import java.nio.file.Files;
import java.nio.file.OpenOption;
import java.nio.file.Paths;

import java.nio.file.StandardOpenOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class ContasService {
    public ArrayList<ContaCorrente> lerContas(String caminho) throws IOException {
        List<String> linhas = Files.readAllLines(Paths.get(caminho));
        ArrayList <ContaCorrente> contas = new ArrayList();

        for(int i = 0; i < linhas.size(); i++){
            String[] dados = linhas.get(i).split(",");
            int numero = Integer.parseInt(dados[0].trim());
            String titular = dados[1].trim();
            double saldo = Double.parseDouble(dados[2].trim());
            ContaCorrente conta = new ContaCorrente(numero, titular, saldo);
            contas.add(conta);
        }
        return contas;
    }

    public Optional<ContaCorrente> lerConta(String caminho, int numero) throws IOException {
        ArrayList<ContaCorrente> contas = lerContas(caminho);
        for(ContaCorrente conta : contas){
            if(numero == conta.getNumero()){
                return Optional.of(conta);
            }
        }
        return Optional.empty();
    }


    public void atualizarContas(ArrayList<ContaCorrente> contas, ContaCorrente conta, String caminho) throws IOException {
        for(int i = 0; i<contas.size(); i++){
            if(contas.get(i).getNumero() == conta.getNumero()){
                contas.remove(i);
                contas.add(i, conta);
            }
        }
        String dados = "";
        for (ContaCorrente contaCorrente : contas) {
            dados += contaCorrente.getNumero() + "," + contaCorrente.getTitular() + "," + contaCorrente.getSaldo() + "\n";
        }
        Files.write(Paths.get(caminho), dados.getBytes());

    }

    public String adicionarConta(ContaCorrente conta, String caminho) throws IOException {
        ArrayList <ContaCorrente> contas = lerContas(caminho);
        for(ContaCorrente contaCorrente : contas){
            if(contaCorrente.getNumero() == conta.getNumero()){
                return "Conta já existente, operação inválida";
            }
        }
        String dados = "\n" + conta.getNumero() + ", " + conta.getTitular() + ", " + conta.getSaldo();
        Files.write(Paths.get(caminho), dados.getBytes(), StandardOpenOption.APPEND);
        return "Conta adicionado com sucesso";
    }

    public String sacar(int numero, double valor, String caminho) throws IOException{
        Optional<ContaCorrente> conta = lerConta(caminho, numero);
        ContaCorrente contaCorrente = conta.get();
        try{
            contaCorrente.sacar(valor);
        }catch(SaldoInsuficienteException e){
            return e.getMessage();
        }
        atualizarContas(lerContas(caminho), contaCorrente, "contas_atualizadas.txt");
        return "Saque realizado com sucesso";
    }

    public String depositar(int numero, double valor, String caminho) throws IOException{
        Optional<ContaCorrente> conta = lerConta(caminho, numero);
        ContaCorrente contaCorrente = conta.get();
        contaCorrente.depositar(valor);
        atualizarContas(lerContas(caminho), contaCorrente, "contas_atualizadas.txt");
        return "Depositos realizado com sucesso";
    }
}
