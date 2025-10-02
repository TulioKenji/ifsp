#include <stdio.h>

int main(){
	int num;
	float numfloat;
	
	printf("digite um numero: ");
	scanf("%d", &num);
	numfloat = num;
	printf("%d/1 = %.1f\n", num, numfloat/1);
	printf("%d/2 = %.1f\n", num, numfloat/2);
	printf("%d/3 = %.1f\n", num, numfloat/3);
	printf("%d/4 = %.1f\n", num, numfloat/4);
	printf("%d/5 = %.1f\n", num, numfloat/5);
	printf("%d/6 = %.1f\n", num, numfloat/6);
	printf("%d/7 = %.1f\n", num, numfloat/7);
	printf("%d/8 = %.1f\n", num, numfloat/8);
	printf("%d/9 = %.1f\n", num, numfloat/9);
	printf("%d/10 = %.1f\n", num, numfloat/10);
	
	return 0;
}
