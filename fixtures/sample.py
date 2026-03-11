# Tiny Python sample used by evaluation fixtures


def fibonacci(n: int) -> int:
    """Return the nth Fibonacci number (0-indexed)."""
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)


def is_palindrome(s: str) -> bool:
    """Return True if s is a palindrome (case-insensitive, alphanumeric only)."""
    cleaned = "".join(c.lower() for c in s if c.isalnum())
    return cleaned == cleaned[::-1]


def even_squares(limit: int) -> list[int]:
    """Return squares of even numbers from 0 to limit (exclusive)."""
    return [i * i for i in range(limit) if i % 2 == 0]


if __name__ == "__main__":
    print(f"fibonacci(7) = {fibonacci(7)}")
    print(f"is_palindrome('racecar') = {is_palindrome('racecar')}")
    print(f"even_squares(10) = {even_squares(10)}")
