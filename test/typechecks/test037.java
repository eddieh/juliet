class Test37 {
    public static void main(String[] args) {
        int i = 1 + (1++);

        // TODO:
        // incompatible types
        // found   : <nulltype>
        // required: int
        // int i = 1 + (1++);
        //           ^

        // RESULT:
        // unexpected type
        // required: variable
        // found   : literal
    }
}
