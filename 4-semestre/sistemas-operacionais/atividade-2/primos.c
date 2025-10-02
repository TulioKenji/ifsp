#include <stdio.h>

void main(){
    long num = 1;
    while(1){
        int isPrimo = 1;
        for(int i = 2; i<num; i++){
            if(num%i == 0){
                isPrimo = 0;
            }
        }
        if(isPrimo){
            printf("%d\n", num);
        }
        num++;
    }
}