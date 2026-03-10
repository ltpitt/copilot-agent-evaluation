public class Sample {

    // Returns the nth Fibonacci number (0-indexed)
    public static int fibonacci(int n) {
        if (n <= 1) {
            return n;
        }
        return fibonacci(n - 1) + fibonacci(n - 2);
    }

    // Checks whether a string is a palindrome (case-insensitive, alphanumeric only)
    public static boolean isPalindrome(String s) {
        String cleaned = s.toLowerCase().replaceAll("[^a-z0-9]", "");
        int left = 0;
        int right = cleaned.length() - 1;
        while (left < right) {
            if (cleaned.charAt(left) != cleaned.charAt(right)) {
                return false;
            }
            left++;
            right--;
        }
        return true;
    }

    public static void main(String[] args) {
        System.out.println("fibonacci(7) = " + fibonacci(7));
        System.out.println("isPalindrome(\"racecar\") = " + isPalindrome("racecar"));
    }
}
