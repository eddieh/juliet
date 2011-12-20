class Test25 {
    public static void main(String[] args) {
        int j = 0;
        int i = ++(j+j);

        // RESULT:
        // unexpected type
        // required: variable
        // found   : value
        // int i = ++(j+j);
        //             ^
    }
}
