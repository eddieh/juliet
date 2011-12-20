class Test5 {
    static int a;
}

class Runner {
    public static void main(String[] args) {
        Test5.a = 13;
        System.out.println(Test5.a);
    }
}

