# Stacks: Playlist Study Notes

A study guide for the **[Stacks](https://www.youtube.com/playlist?list=PLBlnK6fEyqRgWh1emltdMOz8O2m5X3YYn)** playlist by **Neso Academy** (Chapter 6 of their Data Structures course): 36 videos, about 7 h 50 min.

> **How these notes were made:** YouTube transcripts weren't available, so these notes come from each video's title, description and chapter list, with the concepts explained here. The ▶ links jump to the relevant video or chapter. The video index at the end lists exactly what each video covers.

---

## Cheat sheet

| Operation | What it does | Array stack | Linked-list stack |
|---|---|---|---|
| `push(x)` | Put `x` on top | O(1) | O(1), insert at the head |
| `pop()` | Remove and return the top | O(1) | O(1), delete the head |
| `peek()` / `top()` | Read the top without removing it | O(1) | O(1) |
| `isEmpty()` | Is there nothing to pop? | `top == -1` | `head == NULL` |
| `isFull()` | Is there no room to push? | `top == MAX - 1` | Only when `malloc` fails |

- **LIFO (Last In, First Out):** the last element pushed is the first one popped.
- **Overflow:** pushing onto a full stack. **Underflow:** popping from an empty stack.
- **Typical uses:** undo, the function call stack, matching brackets, evaluating expressions, backtracking (DFS), and reversing things.

You can try every operation in the **Interactive Visualizer** tab.

---

## 1. What a stack is

▶ [Introduction to Stacks](https://www.youtube.com/watch?v=I37kGX-nZEI)

- A stack is an **abstract data type (ADT)**. It's defined by its operations, not by how they're implemented.
- **Primary operations:** `push(data)`, `pop()` and `top()`. **Secondary operations:** `isEmpty()` and `isFull()`.
- **Real-life examples:** a pile of plates, or a stack of books, where you only touch the one on top.

---

## 2. Array implementation

▶ [Part 1](https://www.youtube.com/watch?v=rS-ZKTqwi90): the idea · [Part 2](https://www.youtube.com/watch?v=Mlv2fMvt9b4): `push` · [Part 3](https://www.youtube.com/watch?v=1tDjNwntufU): `pop` and underflow · [Part 4](https://www.youtube.com/watch?v=xZuA5hA2yF8): `isFull`, `isEmpty`, the complete program

The array's **end** is the top, and `top` holds the index of the top element. An empty stack has `top == -1`.

```c
#define MAX 100
int stack_arr[MAX];
int top = -1;

int isFull(void)  { return top == MAX - 1; }
int isEmpty(void) { return top == -1; }

void push(int data) {
    if (isFull()) { printf("Stack overflow\n"); return; }
    stack_arr[++top] = data;
}

int pop(void) {
    if (isEmpty()) { printf("Stack underflow\n"); exit(1); }
    return stack_arr[top--];
}

int peek(void) {
    if (isEmpty()) { printf("Stack underflow\n"); exit(1); }
    return stack_arr[top];
}
```

### Variation: top at index 0

▶ [Program 1, Part 1](https://www.youtube.com/watch?v=jj7q_LfW0hQ) · [Part 2](https://www.youtube.com/watch?v=5PodMf7uc-o) · [Part 3](https://www.youtube.com/watch?v=pq9mq_AiELo)

Neso also builds the stack with `stack_arr[0]` as the top. Every push then **shifts all elements one step right** before writing at index 0, and every pop **shifts everything left**. It works, but push and pop become **O(n)** instead of O(1). This shows why the end of the array is the natural top.

---

## 3. Linked-list implementation

▶ [Part 1](https://www.youtube.com/watch?v=0-kkDfCOXOI): why use a linked list, and where the top goes · [Part 2](https://www.youtube.com/watch?v=25oEU6h6zqw): node and `push` · [Part 3](https://www.youtube.com/watch?v=311qJJHiQjU): `pop`, print, `peek`

- **Why a linked list** ([▶ 0:59](https://www.youtube.com/watch?v=0-kkDfCOXOI&t=59s)): there's no fixed capacity, so no overflow until memory runs out.
- **Make the head the top** ([▶ 2:08](https://www.youtube.com/watch?v=0-kkDfCOXOI&t=128s), with the complexity argument at [▶ 4:13](https://www.youtube.com/watch?v=0-kkDfCOXOI&t=253s)). Inserting and deleting at the head of a singly linked list is O(1). At the tail, pop would be O(n), because you'd have to find the second-last node.

```c
struct node { int data; struct node *link; } *top = NULL;

void push(int data) {
    struct node *node = malloc(sizeof(struct node));
    if (node == NULL) { printf("Stack overflow\n"); exit(1); }
    node->data = data;
    node->link = top;   // new node sits on top of the old top
    top = node;
}

int pop(void) {
    if (top == NULL) { printf("Stack underflow\n"); exit(1); }
    struct node *old = top;
    int data = old->data;
    top = top->link;
    free(old);
    return data;
}
```

---

## 4. Classic stack programs

### Prime factors in descending order

▶ [Program 2, Part 1](https://www.youtube.com/watch?v=Bhap9SG4EvI) · [Part 2](https://www.youtube.com/watch?v=PHHyjJk82Mo)

Prime factorization finds factors **smallest first**. Push each factor as you find it, then pop them all: the stack hands them back **largest first**. For 60, you push 2, 2, 3, 5 and pop 5 3 2 2.

```c
for (int i = 2; n > 1; i++)
    while (n % i == 0) { push(i); n /= i; }
while (!isEmpty()) printf("%d ", pop());
```

### Decimal to binary

▶ [Program 3](https://www.youtube.com/watch?v=eEAQX2FzfKo&t=22s)

Repeated division by 2 produces the bits **least significant first**. Push the remainders, then pop to print them in the right order.

```c
while (n > 0) { push(n % 2); n /= 2; }
while (!isEmpty()) printf("%d", pop());   // 13 → 1101
```

### Reversing a stack using two empty stacks

▶ [Program 4, Parts 1–7](https://www.youtube.com/watch?v=hrgkobEya0U)

Each transfer reverses the order. Three transfers (an odd number) leave the original stack reversed:

1. Pop everything from **S** onto **A**. A holds the reverse of S.
2. Pop everything from **A** onto **B**. B is back in S's original order.
3. Pop everything from **B** back onto **S**. S is now reversed.

Along the way, the series also covers:
- **Multiple stacks** in one program ([Part 2](https://www.youtube.com/watch?v=Oi33tvniyHY)).
- **Pass by value vs. pass by reference** ([Part 5 ▶ 5:59](https://www.youtube.com/watch?v=wLMac4N28Kw&t=359s)). A function that should change a caller's stack, or its `top`, must receive a **pointer** to it.
- A dedicated `reverse()` function ([Part 7](https://www.youtube.com/watch?v=wzYfTX7qhGY)).

### Palindrome check

▶ [Program 5](https://www.youtube.com/watch?v=uDfqjMIXB8s)

A palindrome reads the same forwards and backwards, like "racecar". Push the characters, then pop them back: they come out reversed. If the popped sequence matches the original string, it's a palindrome. Checking only the first half against the second half is enough.

---

## 5. Application: balanced (nested) brackets

▶ [Nested Brackets, Part 1](https://www.youtube.com/watch?v=POM1dnAYgL4): types of brackets, valid and invalid examples, the algorithm · [Part 2](https://www.youtube.com/watch?v=BDiPAuWrcJc): the C program

**Algorithm:** scan the expression from left to right.

- **Opening bracket** `(`, `[` or `{`: push it.
- **Closing bracket:** if the stack is empty, or the popped bracket doesn't match, the expression is **invalid**.
- **At the end:** the expression is valid only if the stack is **empty**. Anything left over is an unclosed bracket.

| Expression | Valid? | Why |
|---|---|---|
| `{[a + b] * (c)}` | ✅ | Every closer matches the most recent opener |
| `(a + b]` | ❌ | `]` doesn't match `(` |
| `((a)` | ❌ | One `(` is left on the stack |
| `a + b)` | ❌ | The closer arrives with an empty stack |

LeetCode practice: **Valid Parentheses**, in the LeetCode Practice tab.

---

## 6. Application: infix, postfix and evaluating expressions

▶ Infix to Postfix, Parts 1–8: [1](https://www.youtube.com/watch?v=XfX5jlzWQsg) · [2](https://www.youtube.com/watch?v=IQ3p9yCLYuQ) · [3](https://www.youtube.com/watch?v=aq8S_RJN7bE) · [4](https://www.youtube.com/watch?v=ymG0zxuC__I) · [5](https://www.youtube.com/watch?v=8HeJxuJ8qeY) · [6](https://www.youtube.com/watch?v=7jLR-al8RaM) · [7](https://www.youtube.com/watch?v=qmz9nFacAOE) · [8](https://www.youtube.com/watch?v=imfuqa9E6O8)

### Why postfix?

- **Infix** (`a + b * c`) needs precedence rules, associativity rules and brackets, and evaluating it can take **multiple scans** ([▶ Part 2, 5:30](https://www.youtube.com/watch?v=IQ3p9yCLYuQ&t=330s)).
- **Postfix** (`a b c * +`) puts each operator *after* its operands. It needs **no brackets and no precedence rules**, and evaluates in a **single left-to-right scan** with a stack ([▶ 8:10](https://www.youtube.com/watch?v=IQ3p9yCLYuQ&t=490s)).

**Precedence and associativity** ([Part 1](https://www.youtube.com/watch?v=XfX5jlzWQsg)): `^` binds tightest and is **right**-associative; `*` and `/` come next; `+` and `-` are lowest. Operators of equal precedence are evaluated **left to right**, except `^`.

### Converting infix to postfix

Algorithm: [Part 4](https://www.youtube.com/watch?v=ymG0zxuC__I). C program: [Parts 6–7](https://www.youtube.com/watch?v=7jLR-al8RaM), with the precedence function at [▶ 2:15](https://www.youtube.com/watch?v=qmz9nFacAOE&t=135s).

Scan left to right, using a stack for the operators:

1. **Operand:** write it to the output.
2. **`(`:** push it.
3. **`)`:** pop operators to the output until you reach `(`, then discard the `(`.
4. **Operator `op`:** while the top of the stack is an operator with **higher** precedence, or **equal** precedence when `op` is left-associative, pop it to the output. Then push `op`.
5. **End of input:** pop everything remaining to the output.

| Infix | Postfix |
|---|---|
| `a + b * c` | `a b c * +` |
| `(a + b) * c` | `a b + c *` |
| `a + b * c - d` | `a b c * + d -` |
| `a ^ b ^ c` | `a b c ^ ^` (right-associative) |

### Evaluating postfix

▶ Algorithm: [Part 5, 1:51](https://www.youtube.com/watch?v=8HeJxuJ8qeY&t=111s) · C program: [Part 8](https://www.youtube.com/watch?v=imfuqa9E6O8)

1. **Operand:** push it.
2. **Operator:** pop **twice**. The **first** value popped is the **right** operand. Compute `left op right` and push the result.
3. **At the end,** the single value on the stack is the answer.

`2 3 4 * +` works out as: push 2, 3, 4 → `*` pops 4 and 3, pushes 12 → `+` pops 12 and 2, pushes **14**.

> **Watch the operand order** for `-` and `/`. For `8 2 -`, pop 2 first (right), then 8 (left): the answer is 8 − 2 = 6, not −6.

Part 8 ends by discussing the program's **drawbacks** ([▶ 21:50](https://www.youtube.com/watch?v=imfuqa9E6O8&t=1310s)). A common limitation of simple versions, worth checking in your own code, is that reading one character at a time only handles single-digit operands.

LeetCode practice: **Evaluate Reverse Polish Notation**, which is postfix evaluation.

---

## 7. Exam practice

Each video works through previous-year exam questions on stack operations. Pause and solve them first.

| Video | Exam questions |
|---|---|
| [Important Questions, Set 1](https://www.youtube.com/watch?v=Yu6BE-zFncU) | ISRO CS 2015, UGC NET CS 2016 |
| [Important Questions, Set 2](https://www.youtube.com/watch?v=wJjk3BeOmqA) | ISRO CS 2017, ISRO CS 2018 |
| [GATE Problems, Set 1](https://www.youtube.com/watch?v=4WwkxT_tU9A) | GATE CS 2007, GATE CS 2004 |
| [GATE Problems, Set 2](https://www.youtube.com/watch?v=zxvEOvb5z1g) | GATE CS 2015, UGC NET CS 2014 |

---

## Video index

| # | Video | Length | Covers |
|---|---|---|---|
| 1 | [Introduction to Stacks](https://www.youtube.com/watch?v=I37kGX-nZEI) | 8:33 | Definition, real-life examples, ADT, primary and secondary operations |
| 2 | [Array Implementation (Part 1)](https://www.youtube.com/watch?v=rS-ZKTqwi90) | 10:00 | Empty stack, push and pop on an array |
| 3 | [Array Implementation (Part 2)](https://www.youtube.com/watch?v=Mlv2fMvt9b4) | 11:00 | `push()` in C |
| 4 | [Array Implementation (Part 3)](https://www.youtube.com/watch?v=1tDjNwntufU) | 10:07 | `pop()` and underflow |
| 5 | [Array Implementation (Part 4)](https://www.youtube.com/watch?v=xZuA5hA2yF8) | 15:46 | `isFull()`, `isEmpty()`, complete program |
| 6 | [Important Questions – Set 1](https://www.youtube.com/watch?v=Yu6BE-zFncU) | 6:22 | ISRO 2015, UGC NET 2016 |
| 7 | [Important Questions – Set 2](https://www.youtube.com/watch?v=wJjk3BeOmqA) | 13:24 | ISRO 2017, ISRO 2018 |
| 8–10 | [Program 1, Parts 1](https://www.youtube.com/watch?v=jj7q_LfW0hQ)–[2](https://www.youtube.com/watch?v=5PodMf7uc-o)–[3](https://www.youtube.com/watch?v=pq9mq_AiELo) | 16:26 / 10:09 / 13:36 | Stack with the top at index 0: shifting push/pop, `isEmpty`, `isFull`, `peek` |
| 11–12 | [Program 2, Part 1](https://www.youtube.com/watch?v=Bhap9SG4EvI) / [Part 2](https://www.youtube.com/watch?v=PHHyjJk82Mo) | 9:35 / 11:46 | Prime factors in descending order |
| 13 | [Program 3](https://www.youtube.com/watch?v=eEAQX2FzfKo) | 12:31 | Decimal to binary |
| 14 | [Linked List Implementation (Part 1)](https://www.youtube.com/watch?v=0-kkDfCOXOI) | 9:24 | Why a linked list, top at the head, complexity |
| 15 | [Linked List Implementation (Part 2)](https://www.youtube.com/watch?v=25oEU6h6zqw) | 11:49 | Node structure, `push()` |
| 16 | [Linked List Implementation (Part 3)](https://www.youtube.com/watch?v=311qJJHiQjU) | 11:46 | `pop()`, print, `peek()` |
| 17–23 | Program 4, Parts [1](https://www.youtube.com/watch?v=hrgkobEya0U) · [2](https://www.youtube.com/watch?v=Oi33tvniyHY) · [3](https://www.youtube.com/watch?v=m3Frh9R_Phc) · [4](https://www.youtube.com/watch?v=lRsaSyUFlA4) · [5](https://www.youtube.com/watch?v=wLMac4N28Kw) · [6](https://www.youtube.com/watch?v=haeA3bErNpw) · [7](https://www.youtube.com/watch?v=wzYfTX7qhGY) | ~10–15 min each | Reversing a stack with two empty stacks; multiple stacks; pass by reference |
| 24 | [Program 5](https://www.youtube.com/watch?v=uDfqjMIXB8s) | 17:58 | Palindrome check with a stack |
| 25 | [Nested Brackets (Part 1)](https://www.youtube.com/watch?v=POM1dnAYgL4) | 19:01 | Bracket types, valid/invalid examples, the algorithm |
| 26 | [Nested Brackets (Part 2)](https://www.youtube.com/watch?v=BDiPAuWrcJc) | 25:32 | The C program |
| 27 | [Infix to Postfix (Part 1)](https://www.youtube.com/watch?v=XfX5jlzWQsg) | 10:33 | Operator precedence, evaluating infix, equal priorities |
| 28 | [Infix to Postfix (Part 2)](https://www.youtube.com/watch?v=IQ3p9yCLYuQ) | 13:42 | Why postfix, infix vs. postfix |
| 29 | [Infix to Postfix (Part 3)](https://www.youtube.com/watch?v=aq8S_RJN7bE) | 9:35 | Converting and evaluating by hand |
| 30 | [Infix to Postfix (Part 4)](https://www.youtube.com/watch?v=ymG0zxuC__I) | 11:47 | The conversion algorithm |
| 31 | [Infix to Postfix (Part 5)](https://www.youtube.com/watch?v=8HeJxuJ8qeY) | 8:36 | Evaluating postfix with a stack |
| 32–33 | [Infix to Postfix (Part 6)](https://www.youtube.com/watch?v=7jLR-al8RaM) / [Part 7](https://www.youtube.com/watch?v=qmz9nFacAOE) | 18:49 / 28:02 | C program for the conversion |
| 34 | [Infix to Postfix (Part 8)](https://www.youtube.com/watch?v=imfuqa9E6O8) | 22:47 | C program to evaluate postfix, and its drawbacks |
| 35 | [GATE Problems – Set 1](https://www.youtube.com/watch?v=4WwkxT_tU9A) | 15:15 | GATE 2007, GATE 2004 |
| 36 | [GATE Problems – Set 2](https://www.youtube.com/watch?v=zxvEOvb5z1g) | 8:01 | GATE 2015, UGC NET 2014 |
