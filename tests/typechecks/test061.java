class Test61 {
    public static void main(String[] args) {
        int[] i = {};
        double[] d = {};
        i = d;

        // RESULT:
        // incompatible types
        // found   : double[]
        // required: int[]
        // i = d;
        //     ^

    }
}
