public class Main {
    public static void main(String[] args) {
        long num = 1;
        while(true){
            boolean isprimo = true;
            for(int i = 2; i<num; i++){
                if(num%i==0){
                    isprimo = false;
                }
            }
            if(isprimo){
                System.out.println(num);
            }
            num++;
        }
    }
}
