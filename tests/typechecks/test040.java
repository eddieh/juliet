class Widget {
}

class Test40 {
    public static void main(String[] args) {
        Widget a;
        Widget w = a * 1;

        // RESULT:
        // operator * cannot be applied to Widget,int
        // Widget w = a * 1;
        //              ^
    }
}
