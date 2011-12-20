class Widget {
}

class Test60 {
    public static void main(String[] args) {
        int[] i = {};
        Widget w = new Widget();
        i[0] = w;

        // RESULT:
        // incompatible types
        // found   : Widget
        // required: int
        // i[0] = w;
        //        ^

    }
}
