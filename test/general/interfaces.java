interface Colorable {
    // int RED = 0xff0000, GREEN = 0x00ff00, BLUE = 0x0000ff;
}

interface Labelable {
}

class Point { int x, y; }

class UIPoint extends Point implements Colorable, Labelable {
    int color;
}

class Runner {
    public static void main(String[] args) {
        UIPoint p = new UIPoint();
        p.x = 2;
        p.y = 3;
        // p.color = UIPoint.RED;

        System.out.println("(" + p.x + " " + p.y + ")");
        // System.out.println(p.color);
    }
}
