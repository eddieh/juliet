class Overloading {
    void put(char c) {
        System.out.println("character");
    }

    void put(String s) {
        System.out.println("string");
    }

    void put(double d) {
        System.out.println("double");
    }

    void put(int i) {
        System.out.println("int");
    }

    void put(boolean b) {
        System.out.println("boolean");
    }

    void put(Object o) {
        System.out.println("Object");
    }

    void perform() {
        put('c');
        put("hello");
        this.put('c');
        this.put("hello");
    }

    void vars() {
        char c = 'c';
        int i = 42;
        put(c);
        put(i);
    }

    void expressions() {
        int i = 42, x = 88;
        put(i + x);
    }

    static void place(char c) {
        System.out.println("character");
    }

    static void place(String s) {
        System.out.println("string");
    }
}

class Runner {
    public static void main(String[] args) {
        Overloading o = new Overloading();
        o.put('c');
        o.put("hello");
        o.put(3.14);
        o.put(42);
        o.put(true);
        o.put(null);

        o.perform();
        o.vars();
        o.expressions();

        Overloading.place('c');
        Overloading.place("hello");
    }
}
