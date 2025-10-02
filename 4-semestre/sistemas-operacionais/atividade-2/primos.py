num = 1

while (True):
    isPrimo = True
    for i in range(2, num):
        if num % i == 0 :
            isPrimo = False
    if isPrimo == True :
        print(num)
    num +=1