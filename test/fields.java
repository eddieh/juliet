class Fields {
    int f1 = 10;
    int f2 = 2;
}

// class Field1 {
//     Object f1 = new Object();
// }

class Runner {
    public static void main(String[] args) {
        Fields f = new Fields();
        System.out.println(f.f1 + f.f2);
    }
}
