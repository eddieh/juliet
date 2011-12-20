class Test23 {
    public static void main(String[] args) {
        int i = ++"str";

        // RESULT:
        // unexpected type
        // required: variable
        // found   : value
        // int i = ++"str";
        //           ^
    }
}
