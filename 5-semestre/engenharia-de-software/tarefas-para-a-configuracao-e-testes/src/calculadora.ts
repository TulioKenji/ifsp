export class Calculadora {
    public constructor() { }

    public soma(n1: number, n2: number): number {
        return n1 + n2;
    }

    public subtracao(n1: number, n2: number): number {
        return n1 - n2;
    }

    public multiplicacao(n1: number, n2: number): number {
        return n1 * n2;
    }

    public divisao(n1: number, n2: number): number {
        return n1 / n2;
    }
}