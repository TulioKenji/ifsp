package dao;

import exception.SaldoInsuficienteException;
import model.Conta;
import model.ContaCorrente;
import org.springframework.stereotype.Repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class ContaDAO {

    public String inserir(ContaCorrente conta){
        String sql = "INSERT INTO conta (numero, titular, saldo) values(?, ?, ?);";
        try(Connection connection = Conexao.getConnection()){
            PreparedStatement preparedStatement = connection.prepareStatement(sql);
            preparedStatement.setInt(1, conta.getNumero());
            preparedStatement.setString(2, conta.getTitular());
            preparedStatement.setDouble(3, conta.getSaldo());
            preparedStatement.executeUpdate();
        }catch(SQLException e){
            e.printStackTrace();
            return e.getMessage();
        }
        return "Conta inserida com sucesso";
    }

    public String atualizarSaldo(ContaCorrente conta){
        String sql = "UPDATE conta SET saldo = ? WHERE numero = ?;";
        try(Connection connection = Conexao.getConnection()){
            PreparedStatement preparedStatement = connection.prepareStatement(sql);
            preparedStatement.setDouble(1, conta.getSaldo());
            preparedStatement.setInt(2, conta.getNumero());
            preparedStatement.executeUpdate();
            return "Saldo atualizado com sucesso";
        }catch (SQLException e){
            e.printStackTrace();
            return e.getMessage();
        }
    }

    public String remover(int numero){
        String sql = "DELETE FROM conta WHERE numero = ?;";
        try(Connection connection = Conexao.getConnection()){
            PreparedStatement preparedStatement = connection.prepareStatement(sql);
            preparedStatement.setInt(1, numero);
            preparedStatement.executeUpdate();
        }catch (SQLException e){
            e.printStackTrace();
            return e.getMessage();
        }
        return "Conta removida com sucesso";
    }

    public Optional<Conta> buscarPorNumero(int numero){
        String sql = "SELECT * FROM conta WHERE numero = ?;";
        try(Connection connection = Conexao.getConnection()){
            PreparedStatement preparedStatement = connection.prepareStatement(sql);
            preparedStatement.setInt(1, numero);
            preparedStatement.executeQuery();
            ResultSet resultSet = preparedStatement.getResultSet();
            if(resultSet.next()){
                Conta conta = new ContaCorrente(
                        resultSet.getInt("numero"),
                        resultSet.getString("titular"),
                        resultSet.getDouble("saldo") );
                return Optional.of(conta);
            }
        }catch (SQLException e){
            e.printStackTrace();
        }
        return Optional.empty();
    }

    public List<Conta> listar(){
        String sql = "SELECT * FROM conta";
        List<Conta> contas = new ArrayList<>();
        try(Connection connection = Conexao.getConnection()){
            PreparedStatement preparedStatement = connection.prepareStatement(sql);
            preparedStatement.executeQuery();
            ResultSet resultSet = preparedStatement.getResultSet();
            while(resultSet.next()){
                Conta conta = new ContaCorrente(
                        resultSet.getInt("numero"),
                        resultSet.getString("titular"),
                        resultSet.getDouble("saldo") );
                contas.add(conta);
            }

        }catch (SQLException e){
            e.printStackTrace();
        }
        return contas;
    }

    public String transferir(int numeroOrigem, int numeroDestino, double valor) throws SaldoInsuficienteException {
        String sqlOrigem = "UPDATE conta SET saldo = saldo - ? WHERE numero = ?;";
        String sqlDestino = " UPDATE conta SET saldo = saldo + ? WHERE numero = ?;";

        Optional<Conta> contaOrigem = buscarPorNumero(numeroOrigem);
        if(contaOrigem.isEmpty()){return "conta de origem nao existe";}

        Optional<Conta> contaDestino = buscarPorNumero(numeroDestino);
        if(contaDestino.isEmpty()){return "conta de destino nao existe";}

        if(contaOrigem.get().getSaldo() < valor){
            throw new SaldoInsuficienteException("Saldo insuficiente");
        }

        try(Connection connection = Conexao.getConnection()){
            connection.setAutoCommit(false);
            try (PreparedStatement preparedStatementOrigem = connection.prepareStatement(sqlOrigem);
                PreparedStatement preparedStatementDestino = connection.prepareStatement(sqlDestino)){
                preparedStatementOrigem.setDouble(1, valor);
                preparedStatementOrigem.setInt(2, numeroOrigem);
                preparedStatementDestino.setDouble(1, valor);
                preparedStatementDestino.setInt(2, numeroDestino);
                preparedStatementOrigem.executeUpdate();
                preparedStatementDestino.executeUpdate();
                connection.commit();
            }catch (SQLException e){
                connection.rollback();
                e.printStackTrace();
                return e.getMessage();
            }

        }catch(SQLException e){
            e.printStackTrace();
            return e.getMessage();
        }
        return "transferencia realizada com sucesso";
    }
}
