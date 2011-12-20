class Test58 {
    public static void main(String[] args) {
        int[][] i = {};
        i[0] = 1;

        // RESULT:
        // incompatible types
        // found   : int
        // required: int[]
        // i[0] = 1;
        //        ^

    }
}
