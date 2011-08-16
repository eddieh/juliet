class Conditionals {
    public static void main(String[] args) {
        if (true)
            System.out.println("You see me.");
        if (false)
            System.out.println("I'm invisible.");
        int i = 3;
        String str = (false) ? "wrong" : "correct";
        System.out.println(str);
        if (str) {
            System.out.println("one");
            System.out.println("two");
        }
    }
}

    
