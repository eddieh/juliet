class Test4 {
    public static void main(String[] args) {
        int i = "str" + "str";

        // incompatible types
        // found   : java.lang.String
        // required: int
        // int i = "str" + "str";
        //               ^

    }
}
