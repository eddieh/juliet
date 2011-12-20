class Test59 {
    public static void main(String[] args) {
        int[] i = {};
        i[0] = "str";

        // RESULT:
        // incompatible types
        // found   : java.lang.String
        // required: int
        // i[0] = "str";
        //        ^

    }
}
