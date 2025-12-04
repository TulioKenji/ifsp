/* global use, db */
// MongoDB Playground
// To disable this template go to Settings | MongoDB | Use Default Template For Playground.
// Make sure you are connected to enable completions and to be able to run a playground.
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.
// The result of the last command run in a playground is shown on the results panel.
// By default the first 20 documents will be returned with a cursor.
// Use 'console.log()' to print to the debug output.
// For more documentation on playgrounds please refer to
// https://www.mongodb.com/docs/mongodb-vscode/playgrounds/

// Select the database to use.
use('lojaads');

// db.clientes.insertMany([
//     {
//         nome: "João da Silva",
//         cpf: "15926348732",
//         rg: "RJ 654987123",
//         sexo: "M",
//         nascimento: new Date("1981-12-05"),
//         localNascimento: {
//             cidade: "cidade de Campos",
//             estado: "RJ",
//         },
//         endereco: {
//             rua: "Rua das Flores",
//             numero: 123,
//             complemento: "Apto 45",
//         },
//         contato: {
//             telefone: "(21) 98765-4321",
//             email: null,
//         },
//         salario: null
//     },
//     {
//         nome: "Joana da Silva",
//         cpf: "15asdsad926348732",
//         rg: "RJ 654987123",
//         sexo: "F",
//         nascimento: new Date("1983-12-05"),
//         localNascimento: {
//             cidade: "cidade de Campos",
//             estado: "RJ",
//         },
//         endereco: {
//             rua: "Rua das Dores",
//             numero: 123,
//             complemento: "Apto 45",
//         },
//         contato: {
//             telefone: "(21) 98765-4321",
//             email: null,
//         },
//         salario: null
//     }
// ]);

db.vendedores.insertMany([
    {
        nome: "Paula Toller",
        registro: 335,
        cpf: 13123123,
        salario: 5000,
        dataAdmissao: new Date("2019-03-15"),
        cargo: "Vendedora",
        comissao: 0.05,
    },
    {
        nome: "Sérgio Dias",
        registro: 453,
        cpf: 45454545,
        salario: 6000,
        dataAdmissao: new Date("2018-07-22"),
        cargo: "Vendedor",
        comissao: 0.04,
    }
]);
