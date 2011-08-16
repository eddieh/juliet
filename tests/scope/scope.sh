#!/bin/bash

declare -a output

output[0]="3"
output[1]="undefined"
output[2]="7"
output[3]=$'1\n2'
output[4]="x is not defined"
output[5]=$'3\n1'
output[6]="x is already defined"
output[7]="x is already defined"
output[8]="i is already defined"
output[9]=""
output[10]=$'1\n2'
output[11]="1"
output[12]="x is already defined"
output[13]="9"
output[14]=$'4\n3'

js="/Users/eddie/src/v8-read-only/d8"

pass_count=0
fail_count=0

for (( i = 0 ; i < ${#output[@]} ; i++ ))
do
    run="$js juliet.js -- tests/scope/test$i.java --run Test$i"
    echo -n "Running test$i.java "
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
        cat "tests/scope/test$i.java"
    fi
done

echo ""
echo "SUMMARY"
echo "======="
echo "Passed $pass_count tests."
echo "Failed $fail_count tests."
echo "END TESTS"
