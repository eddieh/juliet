class Test42 {
    public static void main(String[] args) {
        int[] i = {2.1};

        // RESULT:
        // possible loss of precision
        // found   : double
        // required: int
        // int[] i = {2.1};
        //            ^

    }
}
