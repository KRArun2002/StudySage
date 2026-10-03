# Arrays: Playlist Study Notes

Summary of all 16 videos in the [Arrays in C](https://www.youtube.com/playlist?list=PLBlnK6fEyqRhU6vNrQ-6ndkcbM7D7q-U8) playlist by **Neso Academy** (about 1 h 35 min in total). Use these notes to revise, or to decide which video to rewatch.

> **How these notes were made:** each summary was written from the video's transcript. Six videos (1, 2, 6, 9, 10 and 11) have captions turned off, so their sections list the topics from the video description plus a short refresher. Anything marked **Beyond the video** is extra context that the video itself doesn't cover.

---

## Cheat sheet

| Idea | C syntax | Remember |
|---|---|---|
| Declare | `int a[5];` | Length must be known at compile time (except VLAs) |
| Access | `a[i]` | Valid indexes are `0` to `length − 1` |
| Length via macro | `#define N 10` then `int a[N];` | Change the length in one place |
| Initialize | `int a[5] = {1, 2, 3, 4, 5};` | Missing elements become `0` |
| Let the compiler count | `int a[] = {1, 2, 3};` | Length is inferred (3) |
| All zeros | `int a[10] = {0};` | The easiest zero-fill |
| Designated init | `int a[10] = {[0] = 1, [5] = 2};` | Order doesn't matter; the rest are `0` |
| Count elements | `sizeof(a) / sizeof(a[0])` | Only works where `a` is a real array (not a pointer) |
| 2D array | `int m[3][4];` | Rows first, then columns: `m[row][col]` |
| Read-only | `const int a[] = {…};` | Writing to it is a compile error |
| Variable length | `int a[n];` (`n` read at runtime) | No initializer, no `static` |

### Complexity (beyond the playlist)

The playlist teaches arrays through C syntax. This is how the same operations look from a data-structures point of view; the **Interactive Visualizer** tab animates each one.

| Operation | Time | Why |
|---|---|---|
| Access `a[i]` | O(1) | Address = base + i × element size |
| Search for a value | O(n) | You may have to check every element |
| Insert or delete in the middle | O(n) | Later elements shift to make or close a gap |
| Append when there is spare capacity | O(1) | Nothing needs to shift |
| Multiply an n×m matrix by an m×p matrix | O(n·m·p) | Three nested loops (videos 13–14) |

---

## 1D arrays

### 1. Definition of Array · 5:24

[Watch on YouTube ↗](https://www.youtube.com/watch?v=55l-aZ7_F24)

*Captions are unavailable; topics are taken from the video description.*

- What an array is in C
- Introduction to one-dimensional arrays
- Examples of one-dimensional arrays

**Refresher:** an array is a fixed-size collection of elements of the **same type**, stored in **contiguous** memory and reached through a single name plus an index.

### 2. Declaration of Array · 4:43

[Watch on YouTube ↗](https://www.youtube.com/watch?v=Bqud0_ozgcc)

*Captions are unavailable; topics are taken from the video description.*

- Declaring and defining a one-dimensional array
- The syntax for an array
- The length of an array

**Refresher:** `type name[length];`, for example `int marks[5];` reserves room for five `int`s. The length is a constant expression; video 3 recommends defining it with a macro.

### 3. Accessing Array Elements · 5:19

[Watch on YouTube ↗](https://www.youtube.com/watch?v=g0ClJ28-8LE)

- Access an element with the array name and an index in square brackets: `a[0]` is the first element, `a[1]` the second, and so on.
- **Indexes start at 0 and end at length − 1.** An array of length 5 has indexes 0 to 4.
- **Best practice: define the length with a macro.** With `int a[10]` and loops that run to `10`, changing the size means editing every place the number appears. With `#define N 10`, you change one line:

```c
#define N 10

int a[N];
for (int i = 0; i < N; i++) scanf("%d", &a[i]);
for (int i = 0; i < N; i++) printf("%d ", a[i]);
```

### 4. Initializing an Array · 6:32

[Watch on YouTube ↗](https://www.youtube.com/watch?v=GtcRReso9Xk)

There are four ways to give an array its values:

1. **List with a length:** `int a[5] = {1, 2, 3, 4, 5};`
2. **List without a length** (preferred): `int a[] = {1, 2, 3, 4, 5};`. The compiler counts the elements, so you can add more freely.
3. **Assign each index:** `a[0] = 1; a[1] = 2; …`. This needs the length in the declaration and is tedious, so it's not preferred.
4. **Read in a loop:** `for (i = 0; i < 5; i++) scanf("%d", &a[i]);`

Rules to remember:

- **Fewer values than the length:** the remaining elements are filled with `0`. `int a[10] = {1, 2, 3, 4, 5, 6};` leaves `a[6]` to `a[9]` as `0`.
- **Zero-fill shortcut:** `int a[10] = {0};` instead of writing ten zeros.
- **Empty braces are not allowed:** `int a[10] = {};` is invalid in classic C. (*Beyond the video:* C23 finally allows it.)
- **Never give more values than the length:** `int a[5] = {1, 2, 3, 4, 5, 6};` is an error.

### 5. Designated Initialization of Arrays · 6:22

[Watch on YouTube ↗](https://www.youtube.com/watch?v=Sr21AdNJPKg)

Use this when only a few positions should be non-zero and they aren't next to each other.

```c
int a[15] = {[0] = 1, [5] = 2, [6] = 3};   // every other element is 0
```

- Each `[index]` is called a **designator**.
- **Order doesn't matter:** `{[5] = 2, [0] = 1}` is the same array.
- With a length of `n`, every designator must be between `0` and `n − 1`.
- **No length given:** the compiler sets the length to *largest designator + 1*. `int a[] = {[49] = 1};` has length 50.
- **Mixing styles is allowed:** `int a[] = {1, 7, 5, [5] = 90, 6};` gives `1 7 5 0 0 90 6`. A plain value after a designator goes into the next index.
- **When two initializers hit the same index, the later one wins:** in `{1, 2, 3, [2] = 4}`, `a[2]` is `4`.

### 6. Arrays in C (Solved Problem 1) · 4:08

[Watch on YouTube ↗](https://www.youtube.com/watch?v=hsmSDBBsifo)

*Captions are unavailable; topics are taken from the video description.*

- A C program that reverses the order of the numbers stored in an array.

**Refresher:** read the values into an array, then loop **from the last index down to 0** to print them in reverse. Video 16 revisits this program with a user-chosen length.

```c
for (int i = N - 1; i >= 0; i--) printf("%d ", a[i]);
```

### 7. Arrays in C (Solved Problem 2): repeated digits · 10:03

[Watch on YouTube ↗](https://www.youtube.com/watch?v=C57wwOOF6ys)

**Problem:** does any digit appear more than once in a number? (`67827` → yes, the 7 repeats.)

**Idea:** keep a `seen` array of length 10, one slot per digit 0–9, all starting at `0`. Peel digits off the number one at a time:

1. `digit = n % 10` gives the last digit.
2. If `seen[digit]` is already `1`, this digit repeats, so stop.
3. Otherwise set `seen[digit] = 1`, then `n /= 10` to drop that digit.

If the loop stopped early, `n` is still greater than 0 and a digit repeated. If `n` reached 0, every digit was unique.

```c
int seen[10] = {0};
while (n > 0) {
    int digit = n % 10;
    if (seen[digit]) break;
    seen[digit] = 1;
    n /= 10;
}
printf(n > 0 ? "Yes\n" : "No\n");
```

**Beyond the video:** using an array as a "seen" or count table indexed by value is a key interview pattern. It's the core of **Contains Duplicate** in the LeetCode Practice tab.

### 8. Counting Array Elements using sizeof() · 4:05

[Watch on YouTube ↗](https://www.youtube.com/watch?v=iBFzKvCzXsw)

```c
int count = sizeof(a) / sizeof(a[0]);
```

- `sizeof(a)` is the size of the **whole array** in bytes (10 `int`s × 4 bytes = 40).
- `sizeof(a[0])` is the size of **one element** (4 bytes).
- Whole ÷ one element = number of elements (40 ÷ 4 = 10). Any index would work; `0` is conventional because every non-empty array has it.

**Beyond the video (common bug):** this only works where `a` is a real array. Inside a function that receives `int a[]`, `a` is actually a pointer, so `sizeof(a)` gives the pointer's size. Pass the length as a separate parameter instead.

---

## Multidimensional arrays

### 9. Introduction to Multidimensional Arrays · 3:03

[Watch on YouTube ↗](https://www.youtube.com/watch?v=36z4qgN3GWw)

*Captions are unavailable; topics are taken from the video description.*

- Definition of multidimensional arrays
- Their syntax
- Their size

**Refresher:** `type name[d1][d2]…[dk];` creates an array of arrays. The total number of elements is `d1 × d2 × … × dk`; for example, `int a[2][3][4]` holds 24 `int`s.

### 10. Introduction to Two-Dimensional (2D) Arrays · 10:20

[Watch on YouTube ↗](https://www.youtube.com/watch?v=J1aQ9JN4vZY)

*Captions are unavailable; topics are taken from the video description.*

- Defining and declaring a 2D array
- Initializing a 2D array
- Accessing and printing its elements

**Refresher:** think of `int m[3][4]` as 3 rows × 4 columns, and access it as `m[row][col]`. It can be initialized row by row, `int m[2][3] = {{1, 2, 3}, {4, 5, 6}};`, and printed with two nested loops, an outer one for rows and an inner one for columns. C stores the rows one after another in memory (row-major order).

### 11. Introduction to Three-Dimensional (3D) Arrays · 7:59

[Watch on YouTube ↗](https://www.youtube.com/watch?v=bbkdiUbou74)

*Captions are unavailable; topics are taken from the video description.*

- Visualizing a three-dimensional array
- Accessing, initializing and printing its elements

**Refresher:** `int a[2][3][4]` is 2 "layers", each a 3×4 table. Access it as `a[layer][row][col]` and traverse it with three nested loops.

### 12. Multidimensional Arrays (Solved Problem): row and column sums · 5:21

[Watch on YouTube ↗](https://www.youtube.com/watch?v=UbBCg0-xjkU)

**Problem:** read a 5×5 array and print each row's sum and each column's sum.

- **Row sums:** fix the row `i` in the outer loop and move the column `j` in the inner loop.
- **Column sums:** swap the roles. Fix the column `j` in the outer loop and move the row `i` in the inner loop.
- **Reset `sum = 0` after printing each total**, or one row's total leaks into the next.

```c
for (int i = 0; i < 5; i++) {          // row totals
    int sum = 0;
    for (int j = 0; j < 5; j++) sum += a[i][j];
    printf("Row %d: %d\n", i, sum);
}
for (int j = 0; j < 5; j++) {          // column totals
    int sum = 0;
    for (int i = 0; i < 5; i++) sum += a[i][j];
    printf("Column %d: %d\n", j, sum);
}
```

### 13. Matrix Multiplication (Part 1): the math · 6:29

[Watch on YouTube ↗](https://www.youtube.com/watch?v=aAFP5wsmH2k)

- **Each result cell** `(i, j)` comes from **row `i` of the first matrix** and **column `j` of the second**: multiply them element by element and add the products.
- **Compatibility rule:** *columns of A must equal rows of B*. Otherwise some element of the row has no partner in the column.
- **Result size:** *rows of A × columns of B*. A 3×3 times a 3×3 is 3×3; a 2×3 times a 3×2 is 2×2.

### 14. Matrix Multiplication (Part 2): the program · 8:19

[Watch on YouTube ↗](https://www.youtube.com/watch?v=jzdQqoG1tZs)

The program has three parts:

1. Read the row and column counts of A and B.
2. Read the elements of each matrix with nested loops.
3. Compute the product. Refuse with a message if `bRows != aCols`.

The key part is **three nested loops**: `i` walks the rows of A, `j` the columns of B, and `k` walks along row `i` of A and down column `j` of B **at the same time**.

```c
if (bRows != aCols) {
    printf("Sorry, we cannot multiply the matrices A and B\n");
} else {
    for (int i = 0; i < aRows; i++) {
        for (int j = 0; j < bCols; j++) {
            int sum = 0;
            for (int k = 0; k < bRows; k++)   // bRows == aCols
                sum += a[i][k] * b[k][j];
            product[i][j] = sum;
        }
    }
}
```

---

## Special kinds of arrays

### 15. Constant Arrays in C · 2:08

[Watch on YouTube ↗](https://www.youtube.com/watch?v=yK9AFU7fzEA)

- Put `const` in front of the declaration to make any 1D or multidimensional array read-only: `const int a[] = {1, 2, 3};`
- Writing to it, for example `a[1] = 45;`, fails at **compile time** with *"assignment of read-only location"*.
- **Why it's useful:** it guarantees that important data can't be changed by accident, and it tells the compiler your intent so it can catch mistakes.

### 16. Variable Length Arrays in C · 3:57

[Watch on YouTube ↗](https://www.youtube.com/watch?v=JW3Vg0xpJLY)

A **variable length array (VLA)** gets its length at **runtime**, for example one entered by the user:

```c
int n;
printf("How many numbers? ");
scanf("%d", &n);
int a[n];                         // length decided while the program runs
for (int i = 0; i < n; i++) scanf("%d", &a[i]);
for (int i = n - 1; i >= 0; i--) printf("%d ", a[i]);   // reverse, as in video 6
```

- **Advantages:** no fixed length to pick in advance, and any expression works as the length, such as `int a[rows * cols];`.
- **Cannot be `static`:** static storage needs a size fixed at compile time.
- **Cannot have an initializer:** `int a[n] = {0};` is an error, because the size isn't known until the program runs.

**Beyond the video:** VLAs became optional in C11 and some compilers, including MSVC, don't support them. For large or long-lived data, use `malloc` instead.
