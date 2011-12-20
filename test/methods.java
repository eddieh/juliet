class Methods {
    int x = 10;
    
    void increment() {
        x++;
    }

    void decrement() {
        x--;
    }
}

class Runner {
    public static void main(String[] args) {
        Methods m = new Methods();
        m.increment();
        m.increment();
        m.decrement();
        System.out.println(m.x);
    }
}
