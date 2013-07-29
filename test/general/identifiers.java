/*
  javac -encoding UTF8 identifiers.java 
*/
class Identifiers {
    int æ;
    int \u1234;
    int ᵀ;
    int ț;
    int aᵀintˢ1 = 1;

    // not a valid java identifier, so no chance of naming collisions
    // void <a> () {
    // }
}
