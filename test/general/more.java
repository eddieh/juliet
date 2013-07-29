class Lame {
    static int x;
    static int[] y = {};
    int i;

    // FIXME:
    // static class Duck {
    //     static int[] w = null;
    // }

    static Lame[] z = {};
}

class More {
    static int x;
    public static void main(String[] args) {
        // int x;
        // int i = x + 1 + "str";

        // int x;
        // int i = 3 + x;

        // double x;
        // int i = 3 + x;

        // int i = -~1;

        // int i = 1 + -~1 * 3;

        // int x = 0;
        // int i = -- ++ x;

        // int x = 0;
        // int i = ++x + ~-1;

        // int x = 0;
        // int i = x++;

        // int x = 0;
        // int i = x++ --;

        // int x = 0;
        // int i = ++x--;

        // int x = 0;
        // int i = 1 * x++ - x / 3;

        // int[] x = {0};
        // int i = x[0];

        // int i = ("str") ? 1 : 0;

        // String[] v = {""};
        // int i = true ? main(v) : main(v);

        // int i = true ? 0 : 1;

        // int i = true ? "str" : "str";

        // int i = true ? "str" : 0;

        int i;
        i = 0;

        // x = 1;

        // More.x = 2;
        // Lame.x = 3;

        // int[] i = {};
        // i[0] = 0;

        // Lame.y[0] = 4;

        // FIXED: should only be allowed to access class properties on
        // non-instantiated classes (make a UNIT test for this).
        // javac: non-static variable i cannot be referenced from a
        // static context
        // Lame.i = 5;

        // make a UNIT test for this
        // Lame l = new Lame();
        // System.out.println(l.x);
        // l.x = 6;
        // System.out.println(Lame.x);

        // Lame l = new Lame();
        // l.i = 7;

        // make a UNIT test for this
        // javac: int cannot be dereferenced
        // int i;
        // i.length = 1;

        // FIXME:
        // javac: int cannot be dereferenced
        // int i;
        // i = i.length;

        // FIXME:
        // Lame.Duck.w = new int[1];

        // Lame.z[0].x = 8;

        // FIXME:
        // final int i;

        // make a UNIT test for this
        // String[] a = {"str"};
        // main(a) = 7;


    }
}
