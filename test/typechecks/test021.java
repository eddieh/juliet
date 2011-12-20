class Test21 {
    public static void main(String[] args) {
        float j = 1.0;
        int i = ++j;

        // TODO:
        // possible loss of precision
        // found   : float
        // required: int
        // int i = ++j;
        //         ^
    }
}
