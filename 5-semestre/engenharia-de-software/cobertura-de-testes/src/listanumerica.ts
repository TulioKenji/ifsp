export class ListaNumerica {
    private array: Array<number> = [];


    public constructor(array?: Array<number>) {
        this.array = array??[];
    }

    public getArray() {
        return this.array;
    }

    public set(number: number) {
        this.array.push(number);
    }

    public verificaIntervaloElementos(): boolean {
        if( (this.array.length >= 4) && (this.array.length <= 10) ){
            return true;
        }
        return false;
    }

    public verificaIntervaloNumeros(): boolean {
        for (const number of this.array) {
            if (number < 10000 || number > 99999) {
                return false;
            }
        }
        return true;
    }
}