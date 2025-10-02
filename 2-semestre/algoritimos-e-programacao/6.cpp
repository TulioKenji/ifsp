#include <stdio.h>
int main()
 {
	char ifsp[65] = "instituto federal de educacao, ciencia e tecnologia de sao paulo";
	ifsp[0] = 'I';
	ifsp[10] = 'F';
	ifsp[21] = 'E';
	ifsp[31] = 'C';
	ifsp[41] = 'T';
	ifsp[55] = 'S';
	ifsp[59] = 'P';
	printf("%s", ifsp);
	return 0;
 }
