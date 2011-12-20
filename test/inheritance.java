class A {
    int a = 1;
    void announce() {
        System.out.println("hello from A");
    }
    
    void describe() {
        System.out.println("  a = " + this.a);
    }
}

class B extends A {
    int b = 2;
    void announce() {
        System.out.println("hello from B");
    }

    void describe() {
        System.out.println("  a = " + this.a);
        System.out.println("  b = " + this.b);
    }
}

class C extends B {
    int a = 3;
    void announce() {
        System.out.println("hello from C");
    }

    void describe() {
        System.out.println("  a = " + this.a);
        System.out.println("  b = " + this.b);
    }
}

class Inheritance {
    
}

class Runner {
    public static void main(String[] args) {
        A a = new A();
        a.announce();
        a.describe();

        B b = new B();
        b.announce();
        b.describe();

        A b2 = new B();
        b2.announce();
        b2.describe();

        C c = new C();
        c.announce();
        c.describe();
    }
}
