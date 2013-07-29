class JClass {
  private int foo;
  public int bar;

  public JClass() {
    this.foo = 10;
    this.bar = 7;
  }

  public JClass(int a, int b) {
    this.foo = a;
    this.bar = b;
  }

  public int getSeven() {
    return 7;
  }

  public int vlah(JClass z, int x) {
    return 4;
  }

  public int getSevenPlus() {
    int x;
    if (x = 4) {
      12 + 13;
      x += 1;
    }
    return 7 + 9;
  }

  public int getFoo() {
      return foo;
  }

  public void setFoo(int x) {
      this.foo = x;
  }

  private void clearBar() {
    this.bar = 0;
  }

  public void manipulateBar() {
    this.clearBar();
    this.bar = 12;
  }
}

class KClass extends JClass {
  public int bar;
}

class Runner {
  public static void main(String[] args) {
    JClass j = new JClass();
    System.out.println(j.getFoo());
    System.out.println(j.bar);

    j.setFoo(9);
    j.manipulateBar();
    System.out.println(j.getFoo());
    System.out.println(j.bar);

    JClass j1 = new JClass(42, 99);
    System.out.println(j1.getFoo());
    System.out.println(j1.bar);
  }
}
