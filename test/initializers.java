class Initializers {
    static int i;
    int x;
    static {
        i = 3;
    };
    static {};
    {};
    {
        x = 7;
    };
}

class Runner {
    public static void main(String[] args) {
        Initializers i = new Initializers();
        System.out.println(Initializers.i);
        System.out.println(i.x);
    }
}
