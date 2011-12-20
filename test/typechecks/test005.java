class Test5 {
    public static void main(String[] args) {
        int i = 1 + "str" + "str";

        // incompatible types
        // found   : java.lang.String
        // required: int
        // int i = 1 + "str" + "str";
        //                   ^

    }
}
