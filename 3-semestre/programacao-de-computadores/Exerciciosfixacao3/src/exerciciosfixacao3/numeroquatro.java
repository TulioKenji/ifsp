package exerciciosfixacao3;

import java.util.Date;

import java.util.Calendar;

public class numeroquatro {
    public static void main(String[] args) {
        Data mydate = new Data();
        mydate.getData(30,2,2004);
        mydate.dataAtual();
        mydate.nextDay();
        System.out.println(mydate.compararDatas(new int[]{10,8,2004}, new int[]{20,8,2003}));
        mydate.isBissexto();
    }        
}

class Data{
    private int dia;
    private int mes;
    private int ano;

    public void  getData(int dia, int mes, int ano) {
        if((mes>0) && (mes<13)  && ( (dia>0) || (((dia==30) && ((mes == 4) || (mes == 6) || (mes == 9) || (mes == 11))) ||
                ((dia==31) && ((mes == 1) || (mes == 3) || (mes == 5) || (mes == 7) || (mes == 8) || (mes == 10) || (mes == 12))) ||
                ((dia == 28) && (mes == 2)) || ((dia == 29) && ((ano%4)==0))) )){
            this.mes = mes;
            this.dia = dia;
            this.ano = ano;
            System.out.println(dia+"/"+mes+"/"+ano);
        } else{
            System.out.println("erro ao inicializar data");
        }
    }

    public void dataAtual(){
        Calendar dataatual = Calendar.getInstance();
        System.out.println(dataatual.get(Calendar.DAY_OF_MONTH)+" / "+((dataatual.get(Calendar.MONTH))+1)+" / "+dataatual.get(Calendar.YEAR));
    }

    public int getDia() {
        return dia;
    }

    public int getMes() {
        return mes;
    }

    public int getAno() {
        return ano;
    }

    public void setDia(int dia) {
        this.dia = dia;
    }

    public void setMes(int mes) {
        this.mes = mes;
    }

    public void setAno(int ano) {
        this.ano = ano;
    }

    public void mytoString(){
        System.out.println(dia+"/"+mes+"/"+ano);
    }

    public void nextDay(){
        if( (dia == 30) && ( (mes == 4) || (mes == 6) || (mes == 9) || (mes == 11) ) ){
            dia = 1;
            mes +=1;
        } else if( (dia==31) && ((mes == 1) || (mes == 3) || (mes == 5) || (mes == 7) || (mes == 8) || (mes == 10) || (mes == 12)) ){
            if(mes ==12){
                dia = 1;
                mes = 1;
                ano +=1;
            } else{
                dia = 1;
                mes +=1;
            }
        } else if( ((dia == 28) && (mes == 2)) || ((dia == 29) && ((ano%4)==0)) ){
            dia = 1;
            mes+=1;
        } else{
            dia+=1;
        }
        System.out.println(dia+"/"+mes+"/"+ano);
    }

    public int compararDatas(int[] data1, int[] data2){
        if( (data1[0]==data2[0])&&(data1[1]==data2[1])&&(data1[2]==data2[2]) ){
            return 0;
        } else if( data1[2]>data2[2] ){
            return 1;
        } else if( (data1[2]==data2[2])&&(data1[1]>data2[1]) ){
            return 1;
        } else if( (data1[0]>data2[0])&&(data1[1]==data2[1])&&(data1[2]==data2[2]) ){
            return 1;
        }
        return -1;
    }

    public void isBissexto(){
        if( (ano%4 == 0) && (ano%100 !=0) || (ano%400 == 0) ){
            System.out.println("é bissexto");
        } else{
            System.out.println("nao é bissexto");
        }
    }
}