class Test65 {
    public static void main(String[] args) {
        double[] a = {1.1};
        int i = a[0];

        // RESULT:
        // possible loss of precision
        // found   : double
        // required: int
        // int i = a[0];
        //          ^

    }
}
