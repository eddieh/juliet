class Widget {
}

class Test44 {
    public static void main(String[] args) {
        Widget w = new Widget();
        int[] i = {w};

        // RESULT:
        // incompatible types
        // found   : Widget
        // required: int
        // int[] i = {w};
        //            ^

    }
}
