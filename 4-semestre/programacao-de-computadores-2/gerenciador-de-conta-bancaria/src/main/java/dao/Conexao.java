package dao;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class Conexao {
    private static final String URL = "jdbc:mysql://localhost:3306/conta_digital";
    private static final String USER = "springuser";
    private static final String PASSWORD = "";

    public static Connection getConnection() throws SQLException {
        var connection = DriverManager.getConnection(URL, USER, PASSWORD);
        return connection;
    }
}
