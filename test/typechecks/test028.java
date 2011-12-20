class Test28 {
    public static void main(String[] args) {
        String s = "str";
        int i = --s;
    }

    // RESULT:
    // operator -- cannot be applied to java.lang.String
    // int i = --s;
    //         ^
}
