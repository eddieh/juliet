class Test1 {
    static int x = 7;
    public static void main(String[] args) {
        int x = x;
        // TODO: This is broken, it should throw an error at this point.
        //System.out.println(x);
    }
}
