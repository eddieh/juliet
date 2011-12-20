class Fields {
    int f1 = 10;
}

// class Field1 {
//     Object f1 = new Object();
// }

class Runner {
    public static void main(String[] args) {
        Fields f = new Fields();
        System.out.println(f.f1);
    }
}
