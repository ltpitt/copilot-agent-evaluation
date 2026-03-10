// Tiny TypeScript sample used by evaluation fixtures

export function sum(numbers: number[]): number {
    return numbers.reduce((acc, n) => acc + n, 0);
}

export function isPalindrome(s: string): boolean {
    const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, "");
    return cleaned === cleaned.split("").reverse().join("");
}

export async function fetchJson<T>(url: string): Promise<T> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
    }
    return response.json() as Promise<T>;
}
