package controller.banco;

import dao.ContaDAO;
import exception.SaldoInsuficienteException;
import model.Conta;
import model.ContaCorrente;
import model.Transferencia;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("banco")
@CrossOrigin(origins = "*")
public class ContaController {
    @Autowired
    private ContaDAO contaDAO;

    @GetMapping
    public List<Conta> listar(){
        return contaDAO.listar();
    }

    @GetMapping("/{numero}")
    public Optional<Conta> buscarPorNumero(@PathVariable int numero){
        return contaDAO.buscarPorNumero(numero);
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> inserir(@RequestBody ContaCorrente conta){
        String mensagem = contaDAO.inserir(conta);

        Map<String, String> response = new HashMap<>();
        response.put("mensagem", mensagem);
        return ResponseEntity.ok(response);
    }

    @PutMapping
    public ResponseEntity<Map<String, String>> atualizarSaldo(@RequestBody ContaCorrente conta){
        String mensagem = contaDAO.atualizarSaldo(conta);

        Map<String, String> response = new HashMap<>();
        response.put("mensagem", mensagem);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/transferir")
    public ResponseEntity<Map<String, String>> transferir(@RequestBody Transferencia transferencia) throws SaldoInsuficienteException {
        String mensagem = contaDAO.transferir(transferencia.getNumeroOrigem(),
                            transferencia.getNumeroDestino(),
                            transferencia.getValor());

        Map<String, String> response = new HashMap<>();
        response.put("mensagem", mensagem);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{numero}")
    public ResponseEntity<Map<String, String>> removerConta(@PathVariable int numero){
        String mensagem = contaDAO.remover(numero);
        Map<String, String> response = new HashMap<>();
        response.put("mensagem", mensagem);
        return ResponseEntity.ok(response);
    }
}
