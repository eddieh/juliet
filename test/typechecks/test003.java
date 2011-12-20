class Test3 {
    public static void main(String[] args) {
        int i = 3 + "str";

        // incompatible types
        // found   : java.lang.String
        // required: int
        // int i = 3 + "str";
        //           ^

    }
}
