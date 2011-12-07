class Test26 {
    public static int num() {
        return 0;
    }

    public static void main(String[] args) {
        int i = ++num();
    }

    // TODO:
    // unexpected type
    // required: variable
    // found   : value
    //     int i = ++num();
    //                  ^
}
