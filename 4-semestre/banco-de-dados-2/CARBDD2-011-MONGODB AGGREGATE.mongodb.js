use('lojaads');


// db.produtos.aggregate([
//     {
//         $match: { preco: {$gte: 100} }
//     },
//     {
//         $sort : { preco: 1 }
//     }
// ]);

db.clientes.aggregate([
    {
        $lookup: {
          from: "compras",
          localField: "codigo",
          foreignField: "codigo",
          as: "compras"
        }
    },
    {
        $unwind: "$compras"
    },
    
]);
