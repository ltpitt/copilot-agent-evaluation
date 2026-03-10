// Tiny Go sample used by evaluation fixtures
package main

import (
	"fmt"
	"strings"
	"unicode"
)

// Fibonacci returns the nth Fibonacci number (0-indexed).
func Fibonacci(n int) int {
	if n <= 1 {
		return n
	}
	return Fibonacci(n-1) + Fibonacci(n-2)
}

// IsPalindrome returns true if s is a palindrome (case-insensitive, letters/digits only).
func IsPalindrome(s string) bool {
	var cleaned []rune
	for _, r := range strings.ToLower(s) {
		if unicode.IsLetter(r) || unicode.IsDigit(r) {
			cleaned = append(cleaned, r)
		}
	}
	n := len(cleaned)
	for i := 0; i < n/2; i++ {
		if cleaned[i] != cleaned[n-1-i] {
			return false
		}
	}
	return true
}

func main() {
	fmt.Printf("Fibonacci(7) = %d\n", Fibonacci(7))
	fmt.Printf("IsPalindrome(\"racecar\") = %v\n", IsPalindrome("racecar"))
}
