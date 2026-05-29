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

    public divisao(n1: number, n2: number): number | null {
        try {
            if (n2 === 0)
                throw new Error('Divisão por zero')
            return n1 / n2;
        } catch (error) {
            return null;
        }
    }

    public radiciacao(n1: number, n2: number): number | null {
        try {
            if (n2 === 0)
                throw new Error('Radiciação por zero')
            return n1 ** (1 / n2);
        } catch (error) {
            return null;
        }
    }

    public potenciacao(n1: number, n2: number): number {
        return n1 ** n2;
    }
}