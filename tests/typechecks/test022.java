class Test22 {
    public static void main(String[] args) {
        double j = 1.0;
        int i = ++j;

        // RESULT:
        // possible loss of precision
        // found   : double
        // required: int
        // int i = ++j;
        //         ^
    }
}
