class Widget {
}

class Test39 {
    public static void main(String[] args) {
        Widget a, b;
        Widget w = a * b;

        // RESULT:
        // operator * cannot be applied to Widget,Widget
        // Widget w = a * b;
        //              ^
    }
}
