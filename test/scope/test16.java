class Test16 {
    static void static_method() {
        System.out.println("Hello from static_method()");
    }

    void instance_method() {
        static_method();
        Test16.static_method();
    }
}

class Runner {
    public static void main(String[] args) {
        Test16 t = new Test16();
        t.instance_method();
    }
}
