#!/bin/bash

declare -a files
declare -a principals
declare -a output

files[0]="tests/arrays.java"
files[1]="tests/assignments.java"
files[2]="tests/conditionals.java"
files[3]="tests/fields.java"
files[4]="tests/hello.java"
#files[]="tests/identifiers.java"
files[5]="tests/inheritance.java"
files[6]="tests/initializers.java"
files[7]="tests/interfaces.java"
files[8]="tests/jclass.java"
files[9]="tests/literals.java"
files[10]="tests/loops.java"
files[11]="tests/methods.java"
files[12]="tests/overloading.java"
#files[13]="tests/privates.java"
#files[14]="tests/qualifiers.java"

principals[0]="Arrays"
principals[1]="Assignments"
principals[2]="Conditionals"
principals[3]="Runner"
principals[4]="Hello"
principals[5]="Runner"
principals[6]="Runner"
principals[7]="Runner"
principals[8]="Runner"
principals[9]="Literals"
principals[10]="Loops"
principals[11]="Runner"
principals[12]="Runner"

output[0]=$'96\n42'
output[1]="0"
output[2]="You see me.
correct
one
two"
output[3]="10"
output[4]="I'm alive!"
output[5]="hello from A
  a = 1
hello from B
  a = 1
  b = 2
hello from B
  a = 1
  b = 2
hello from C
  a = 3
  b = 2"
output[6]=$'3\n7'
output[7]="(2 3)"
output[8]="3
7
9
12
42
99"
output[9]="string
c
3.14
42
false
true
null"
output[10]="twice
twice
three
three
three"
output[11]="11"
output[12]="character
string
double
int
boolean
Object
character
string
character
string
character
int
int
character
string"
#output[13]=""
#output[14]=""
#output[15]=$'4\n3'

js="/Users/eddie/src/v8-read-only/d8"

pass_count=0
fail_count=0

for (( i = 0 ; i < ${#output[@]} ; i++ ))
do
    run="$js juliet.js -- ${files[$i]} --run ${principals[$i]}"
    echo -n "Running ${files[$i]} "
    result=$($run)
    if [[ "$result" == "${output[$i]}" ]]; then
        (( pass_count += 1 ))
        echo "pass"
    else
        (( fail_count += 1 ))
        echo "FAIL"
        echo "Expected:"
        echo "${output[$i]}"
        echo "Actual:"
        echo "$result"
        echo "Code:"
        cat "${files[$i]}"
    fi
done

echo ""
echo "SUMMARY"
echo "======="
echo "Passed $pass_count tests."
echo "Failed $fail_count tests."
echo "END TESTS"
