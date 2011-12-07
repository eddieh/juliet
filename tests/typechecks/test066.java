class Test66 {
    public static void main(String[] args) {
        String[] a = {"str"};
        int i = a[0];

        // RESULT:
        // incompatible types
        // found   : java.lang.String
        // required: int
        // int i = a[0];
        //          ^

    }
}
