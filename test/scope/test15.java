class Test15 {
    static void static_method() {
        System.out.println("Hello from static_method()");
    }

    public static void main(String[] args) {
        static_method();
        Test15.static_method();
    }
}
