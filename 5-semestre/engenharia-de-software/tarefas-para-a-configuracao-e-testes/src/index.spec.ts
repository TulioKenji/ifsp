import { Calculadora } from "./calculadora";
import { ListaNumerica } from "./listaNumerica";

describe("Introdução", () => {
    test("Hello world!", () => {
        expect(1).toBe(1)
    })
})


describe("classe Matematica", () => {
    let calc = new Calculadora();

    test("Somar dois números", () => {
        expect(calc.soma(10, 2)).toBe(12)
    })

    test("Subtrair dois números", () => {
        expect(calc.subtracao(10, 2)).toBe(8)
    })

    test("Multiplicar dois números", () => {
        expect(calc.multiplicacao(10, 2)).toBe(20)
    })

    test("Dividir dois números", () => {
        expect(calc.divisao(10, 2)).toBe(5)
    })

})

describe("classe Intervalo", () => {

    test("4 elementos", () => {
        const list = new ListaNumerica([52208, 27270, 65319, 10294]);
        expect(list.verificaIntervaloElementos()).toBe(true);
    })
    test("3 elementos", () => {
        const list = new ListaNumerica([52208, 27270, 65319]);
        expect(list.verificaIntervaloElementos()).toBe(false);
    })
    test("5 elementos", () => {
        const list = new ListaNumerica([52208, 27270, 65319, 10294, 78901]);
        expect(list.verificaIntervaloElementos()).toBe(true);
    })

    test("10 elementos", () => {
        const list = new ListaNumerica([56208, 27270, 65319, 10294, 14531, 15968, 70787, 32033, 10000, 99999]);
        expect(list.verificaIntervaloElementos()).toBe(true);
    })
    test("9 elementos", () => {
        const list = new ListaNumerica([56208, 27270, 65319, 10294, 14531, 15968, 70787, 32033, 10000]);
        expect(list.verificaIntervaloElementos()).toBe(true);
    })
    test("11 elementos", () => {
        const list = new ListaNumerica([56208, 27270, 65319, 10294, 14531, 15968, 70787, 32033, 10000, 99999, 12345]);
        expect(list.verificaIntervaloElementos()).toBe(false);
    })

    test("limite minimo", () => {
        const list = new ListaNumerica([52208, 27270, 65319, 10000]);

        expect(list.verificaIntervaloNumeros()).toBe(true);
    });
    test("abaixo limite minimo", () => {
        const list = new ListaNumerica([52208, 27270, 65319, 9999]);

        expect(list.verificaIntervaloNumeros()).toBe(false);
    });
    test("acima limite minimo", () => {
        const list = new ListaNumerica([52208, 27270, 65319, 10001]);

        expect(list.verificaIntervaloNumeros()).toBe(true);
    });

    test("limite maximo", () => {
        const list = new ListaNumerica([52208, 27270, 65319, 99999]);

        expect(list.verificaIntervaloNumeros()).toBe(true);
    });
    test("abaixo maximo", () => {
        const list = new ListaNumerica([52208, 27270, 65319, 99998]);

        expect(list.verificaIntervaloNumeros()).toBe(true);
    });
    test("acima limite maximo", () => {
        const list = new ListaNumerica([52208, 27270, 65319, 100000]);
        expect(list.verificaIntervaloNumeros()).toBe(false);
    });

})