class Test19 {
    public static void main(String[] args) {
        int i = ++1.0;

        // RESULT:
        // unexpected type
        // required: variable
        // found   : value
        // int i = ++1.0;
        //           ^
    }
}
