const soma =[
    [1, 2, 3],
    [4, 5, 9],
    [3, -2, 1],
    [NaN, 2, NaN],
    [1, NaN, NaN],
    [Infinity, 1, Infinity]
]

const subtracao = [
    [1, 2, -1],
    [4, 5, -1],
    [3, -2, 5],
    [NaN, 2, NaN],
    [1, NaN, NaN],
    [Infinity, 1, Infinity]
]

const multiplicacao = [
    [1, 2, 2],
    [4, 5, 20],
    [3, -2, -6],
    [NaN, 2, NaN],
    [1, NaN, NaN],
    [Infinity, 1, Infinity]
]

const divisao = [
    [1, 2, 0.5],
    [4, 5, 0.8],
    [3, -2, -1.5],
    [NaN, 2, NaN],
    [1, NaN, NaN],
    [Infinity, 1, Infinity],
    [1, 0, null]
]

const radiciacao = [
    [1, 2, 1],
    [4, 2, 2],
    [27, 3, 3],
    [NaN, 2, NaN],
    [1, NaN, NaN],
    [Infinity, 2, Infinity],
    [1, 0, null]
]

const potenciacao = [
    [1, 2, 1],
    [4, 2, 16],
    [3, -2, 1/9],
    [NaN, 2, NaN],
    [1, NaN, NaN],
    [Infinity, 2, Infinity],
    [1, 0, 1]
]

export default {
    soma,
    subtracao,
    multiplicacao,
    divisao,
    radiciacao,
    potenciacao
}