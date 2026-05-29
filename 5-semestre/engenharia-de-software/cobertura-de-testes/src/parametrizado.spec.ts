import { Calculadora } from "./calculadora";
import jsonparametros from "./data/parametros.json";
import tsparametros from "./data/parametros";

const parametrossoma = [...jsonparametros.soma, ...tsparametros.soma];
const parametrossubtracao = [...jsonparametros.subtracao, ...tsparametros.subtracao];
const parametrosmultiplicacao = [...jsonparametros.multiplicacao, ...tsparametros.multiplicacao];
const parametrossdivisao = [...jsonparametros.divisao, ...tsparametros.divisao];
const parametrossradiciacao = [...jsonparametros.radiciacao, ...tsparametros.radiciacao];
const parametrosspotenciacao = [...jsonparametros.potenciacao, ...tsparametros.potenciacao];

describe("classe Matematica parametrizada", () => {
    let calc = new Calculadora();
    test.each(parametrossoma)('Somar %i e %i deve retornar %i', (a, b, expected) => {
        expect(calc.soma(a, b)).toBe(expected);
    });
    test.each(parametrossubtracao)('Subtrair %i e %i deve retornar %i', (a, b, expected) => {
        expect(calc.subtracao(a, b)).toBe(expected);
    });
    test.each(parametrosmultiplicacao)('Multiplicar %i e %i deve retornar %i', (a, b, expected) => {
        expect(calc.multiplicacao(a, b)).toBe(expected);
    });
    test.each(parametrossdivisao)('Dividir %i e %i deve retornar %i', (a, b, expected) => {
        expect(calc.divisao(a!, b!)).toBe(expected);
    });
    test.each(parametrossradiciacao)('Radiciar %i e %i deve retornar %i', (a, b, expected) => {
        expect(calc.radiciacao(a!, b!)).toBe(expected);
    });
    test.each(parametrosspotenciacao)('Potenciar %i e %i deve retornar %i', (a, b, expected) => {
        expect(calc.potenciacao(a, b)).toBe(expected);
    });

});