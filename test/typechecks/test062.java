class Test62 {
    public static void main(String[] args) {
        int[][] i = {};
        double[] d = {1.1};
        i[0] = d;

        // RESULT:
        // incompatible types
        // found   : double[]
        // required: int[]
        // i[0] = d;
        //        ^
    }
}
