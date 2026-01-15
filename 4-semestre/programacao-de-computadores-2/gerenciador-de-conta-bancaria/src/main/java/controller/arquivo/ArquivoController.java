package controller.arquivo;

import exception.SaldoInsuficienteException;
import model.Conta;
import model.ContaCorrente;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import service.ContasFilterService;
import service.ContasService;
import service.TarifaService;
import strategy.TarifaStrategy;

import java.io.IOException;
import java.util.*;

@RestController
@RequestMapping("arquivo")
@CrossOrigin(origins = "*")
public class ArquivoController {
    @Autowired
    ContasService contasService;

    @Autowired
    ContasFilterService contasFilterService;

    @GetMapping
    public ArrayList<ContaCorrente> listar() throws IOException {
        return contasService.lerContas("contas.txt");
    }

    @GetMapping("/atualizadas")
    public ArrayList<ContaCorrente> listarAtualizado() throws IOException {
        return contasService.lerContas("contas_atualizadas.txt");
    }

    @GetMapping("/{numero}")
    public Optional<ContaCorrente> buscarPorNumero(@PathVariable int numero) throws IOException {
        return contasService.lerConta("contas.txt", numero);
    }

    @GetMapping("/tarifa/{strategy}/{numero}")
    public ResponseEntity<Map<String, String>> calcularTarifa(@PathVariable TarifaStrategy strategy , @PathVariable int numero) throws IOException {
        Optional<ContaCorrente> conta = contasService.lerConta("contas.txt", numero);
        double mensagem = TarifaService.calcularTarifa(conta.get(), strategy);
        Map<String, String> response = new HashMap<>();
        response.put("mensagem", String.valueOf(mensagem));
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> inserirConta(@RequestBody ContaCorrente contaCorrente) throws IOException {
        String mensagem = contasService.adicionarConta(contaCorrente, "contas.txt");

        Map<String, String> response = new HashMap<>();
        response.put("mensagem", mensagem);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/sacar")
    public ResponseEntity<Map<String, String>> sacar(@RequestBody ContaCorrente conta) throws IOException{
        String mensagem = contasService.sacar(conta.getNumero(), conta.getSaldo(), "contas.txt");

        Map<String, String> response = new HashMap<>();
        response.put("mensagem", mensagem);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/depositar")
    public ResponseEntity<Map<String, String>> depositar(@RequestBody ContaCorrente conta) throws IOException{
        String mensagem = contasService.depositar(conta.getNumero(), conta.getSaldo(), "contas.txt");

        Map<String, String> response = new HashMap<>();
        response.put("mensagem", mensagem);
        return ResponseEntity.ok(response);
    }

    //filtros

    @GetMapping("/saldomaiorquemil/{caminho}")
    public List<ContaCorrente> contasComSaldoMaiorQueMil(@PathVariable String caminho) throws IOException {
        return contasFilterService.contasComSaldoMaiorQueMil(caminho);
    }

    @GetMapping("/saldototal/{caminho}")
    public ResponseEntity<Map<String, String>> saldoTotal(@PathVariable String caminho) throws IOException {
        double mensagem = contasFilterService.saldoTotal(caminho);
        Map<String, String> response = new HashMap<>();
        response.put("mensagem", String.valueOf(mensagem));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/faixadesaldo/{caminho}")
    public Map<String, List<ContaCorrente>> agruparPorFaixaDeSaldo(@PathVariable String caminho) throws IOException {
        return contasFilterService.agruparPorFaixaDeSaldo(caminho);
    }

    @GetMapping("/saldomaiorquecincomil/{caminho}")
    public List<ContaCorrente> contasComSaldoMaiorQueCinil(@PathVariable String caminho) throws IOException {
        return contasFilterService.contasComSaldoMaiorQueCincoMil(caminho);
    }

    @GetMapping("/numeropar/{caminho}")
    public List<ContaCorrente> contasComNumeroPar(@PathVariable String caminho) throws IOException {
        return contasFilterService.contasComNumeroPar(caminho);
    }

    @GetMapping("/ordenarcontas/{caminho}")
    public List<ContaCorrente> ordenarListaDeContas(@PathVariable String caminho) throws IOException {
        return contasFilterService.ordenarListaDeContas(caminho);
    }
}
