class Test17 {
    static void static_method() {
        // TODO: this should print an error like the following
        // non-static method instance_method() cannot be referenced
        // from a static context
        instance_method();
    }

    void instance_method() {
    }
}
