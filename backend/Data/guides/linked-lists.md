# Linked Lists: Playlist Study Notes

A study guide for the two Linked Lists playlists in this course:

- **[Linked Lists by Jenny's Lectures](https://www.youtube.com/playlist?list=PLnccP3XNVxGrks-guEVjE1xj9V9YC5oQ7)**: 21 videos, about 7.5 hours. Covers singly, doubly, circular and doubly circular lists, with full C code.
- **[Singly Linked List by Neso Academy](https://www.youtube.com/playlist?list=PLBlnK6fEyqRi3-lvwLGzcaquOs5OBTCww)**: 33 short videos, about 3.3 hours. Covers every singly-linked-list operation compared against arrays, plus exam (GATE/ISRO/UGC NET) problems.

> **How these notes were made:** YouTube transcripts weren't available, so these notes come from each video's title, description and chapter list, with the concepts explained here. The ▶ links jump to the matching point in each video. The video index at the end lists exactly what each video covers.

---

## Cheat sheet

| Operation | Singly | Doubly | Array |
|---|---|---|---|
| Access the k-th element | O(n) | O(n) | O(1) |
| Insert / delete at the beginning | O(1) | O(1) | O(n), elements shift |
| Insert at the end (head pointer only) | O(n) | O(n) | O(1) if not full |
| Insert at the end (with a tail pointer) | O(1) | O(1) | n/a |
| Delete at the end | O(n), needs the second-last node | O(1) with a tail pointer | O(1) |
| Insert / delete at a given position | O(n) to walk there, O(1) to relink | O(n) + O(1) | O(n) shifting |
| Traverse, count, search | O(n) | O(n) | O(n) |
| Extra memory per element | 1 pointer | 2 pointers | none (but fixed capacity) |

**The one-line summary:** arrays win at random access; linked lists win at inserting and deleting without shifting, as long as you're already at the right spot.

---

## 1. Why linked lists exist

▶ Jenny [2.1 Introduction](https://www.youtube.com/watch?v=dmb1i4oN5oE&t=179s) (limitations of arrays from 2:59) · Neso [Introduction](https://www.youtube.com/watch?v=R9PTBwOzceo)

- An array needs **one contiguous block** of memory, sized in advance. Growing it means allocating a bigger block and copying everything, and inserting in the middle means shifting elements.
- A linked list stores each element in its own **node**, anywhere in memory. Each node holds the **data** and a **pointer to the next node**. The list is reached through a `head` pointer, and the last node points to `NULL`.
- Nodes are created at runtime with `malloc`, which makes this **dynamic memory allocation**. That's the answer to the classic quiz question in Neso's [Rapid Fire Quiz](https://www.youtube.com/watch?v=7lMlHBOEhag&t=160s).

### Arrays vs linked lists

▶ Jenny [2.3 Arrays vs Linked List](https://www.youtube.com/watch?v=qauEA64G1Ds) · Neso [Array vs. Single Linked List](https://www.youtube.com/watch?v=b5QR4AmrspU)

| | Array | Linked list |
|---|---|---|
| Access by index | O(1): base address + offset ([▶ 1:20](https://www.youtube.com/watch?v=qauEA64G1Ds&t=80s)) | O(n): follow pointers from the head |
| Memory | Fixed size; unused capacity is wasted | Grows one node at a time, but each node pays for a pointer ([▶ 5:26](https://www.youtube.com/watch?v=qauEA64G1Ds&t=326s)) |
| Insert / delete | Shift elements | Change a couple of pointers ([▶ 13:16](https://www.youtube.com/watch?v=qauEA64G1Ds&t=796s)) |
| Search | Binary search possible if sorted | Linear search only ([▶ 20:21](https://www.youtube.com/watch?v=qauEA64G1Ds&t=1221s)) |
| Cache friendliness | Excellent (contiguous) | Poor (nodes are scattered) |

---

## 2. The node and building a list

▶ Neso [Creating the Node](https://www.youtube.com/watch?v=DneLxrPmmsw) · [Creating a List (Part 1)](https://www.youtube.com/watch?v=nxtDe6Gq4t4) · [Part 2](https://www.youtube.com/watch?v=HrY_YmU1vdg) · Jenny [2.4 Implementation](https://www.youtube.com/watch?v=6wXZ_m3SbEs&t=100s)

A node is a **self-referential structure**: a struct that contains a pointer to its own type.

```c
struct node {
    int data;
    struct node *next;
};

struct node *head = NULL;

struct node *create_node(int data) {
    struct node *node = malloc(sizeof(struct node));
    node->data = data;
    node->next = NULL;
    return node;
}
```

Jenny's 2.4 builds a list from user input with a `head` pointer and a moving `temp` pointer: the first node becomes `head`, and each later node is attached with `temp->next = newnode; temp = newnode;` ([▶ 16:00](https://www.youtube.com/watch?v=6wXZ_m3SbEs&t=960s)).

---

## 3. Traversal: count, print, length

▶ Neso [Counting the Nodes](https://www.youtube.com/watch?v=e0s-zmpedYo) · [Printing the Data](https://www.youtube.com/watch?v=FIV-0A0mZd8) · [Traversal vs. Arrays](https://www.youtube.com/watch?v=b7HpuVs3Xi0) · Jenny [2.7 Find length](https://www.youtube.com/watch?v=SbGRuk38MvI)

Every traversal follows the same pattern: start at `head` and follow `next` until you reach `NULL`.

```c
int length(struct node *head) {
    int count = 0;
    for (struct node *p = head; p != NULL; p = p->next) count++;
    return count;
}
```

- Traversal is O(n) for both arrays and lists. The difference is that a list **can't jump** straight to the middle.
- **Never move `head` itself** while traversing. Use a separate pointer, or you lose the list.

---

## 4. Insertion

▶ Jenny [2.5 Insertion](https://www.youtube.com/watch?v=dq3F3e9o2DM) · Neso [at End](https://www.youtube.com/watch?v=LYGbeWnYXd8) · [at Beginning](https://www.youtube.com/watch?v=jgqg6Qw68_Q) · [at a Position](https://www.youtube.com/watch?v=0hGxILnKvJk)

**At the beginning, O(1)** ([▶ Jenny 1:34](https://www.youtube.com/watch?v=dq3F3e9o2DM&t=94s)):

```c
struct node *node = create_node(value);
node->next = head;   // 1. point the new node at the old first node
head = node;         // 2. then move head
```

> **Common mistake** (Neso [Possible Mistake](https://www.youtube.com/watch?v=YL8MnLAJOMg)): if a helper function receives `head` **by value** and reassigns it, the caller's `head` doesn't change. Either return the new head (Neso's [2nd Method](https://www.youtube.com/watch?v=90zyJ1eVeUw)) or pass `struct node **head`.

**At the end, O(n) without a tail pointer** ([▶ Jenny 9:32](https://www.youtube.com/watch?v=dq3F3e9o2DM&t=572s)): walk to the last node, the one whose `next` is `NULL`, and set `last->next = node`. Keeping a `tail` pointer makes this O(1).

**At position `pos`** ([▶ Jenny 16:59](https://www.youtube.com/watch?v=dq3F3e9o2DM&t=1019s)): walk to the node **before** the position, then relink. The order of the two assignments matters. Positions here are 1-based and `pos ≥ 2`; position 1 is "insert at the beginning":

```c
struct node *p = head;
for (int i = 1; i < pos - 1; i++) p = p->next;   // stop one node early
node->next = p->next;   // 1. new node takes over the rest of the list
p->next = node;         // 2. previous node points to the new one
```

Swap those two lines and you lose the rest of the list.

**Compared with arrays** (Neso's "vs. Array" videos for the [end](https://www.youtube.com/watch?v=80gNiLhyr7A), [beginning](https://www.youtube.com/watch?v=IdRq1uz4-t0) and [a position](https://www.youtube.com/watch?v=_ajoEqskMHE)):

- An array that isn't full inserts at the end in O(1), but a full array must be copied into a bigger one: O(n). See Neso's [Part 2](https://www.youtube.com/watch?v=egUHjERGf88).
- Inserting at the beginning of an array is always O(n), because every element shifts.

---

## 5. Deletion

▶ Jenny [2.6 Deletion](https://www.youtube.com/watch?v=ClvYytk5Rlg) · Neso [First Node](https://www.youtube.com/watch?v=-rcIWx-JTxw) · [Last Node](https://www.youtube.com/watch?v=TpgxJupHATQ) · [Last Node (single pointer)](https://www.youtube.com/watch?v=8flOSiGsO-g) · [At a Position](https://www.youtube.com/watch?v=f1r_jxCyOl0) · [Entire List](https://www.youtube.com/watch?v=ScKTk5GwmG4)

**First node, O(1):**

```c
struct node *old = head;
head = head->next;
free(old);
```

**Last node, O(n):** you need the **second-last** node so you can set its `next` to `NULL`. Either walk with two pointers (`prev` trailing `curr`), or use a single pointer that stops while `p->next->next != NULL`. Neso shows both versions.

**At a position:** walk to the node before it, then `prev->next = target->next; free(target);`

**The whole list:** walk the list freeing each node, but **save `next` before freeing**, because you can't read a node after it's freed. Finish by setting `head = NULL`.

> Always handle the edge cases: an **empty list** and a list with **exactly one node**.

---

## 6. Reversing a list

▶ Jenny [2.8 Reverse (Iterative)](https://www.youtube.com/watch?v=Tk_fi5l8cag&t=117s) · Neso [Reverse a Single Linked List](https://www.youtube.com/watch?v=XgABnoJLtG4)

Use three pointers, `prev`, `curr` and `next`, and flip one link per step. It runs in O(n) time with O(1) extra space. You can watch it animate in the **Interactive Visualizer** tab.

```c
struct node *prev = NULL, *curr = head, *next;
while (curr != NULL) {
    next = curr->next;   // remember the rest of the list
    curr->next = prev;   // flip this link
    prev = curr;         // move both pointers one step forward
    curr = next;
}
head = prev;
```

LeetCode practice: **Reverse Linked List**, **Palindrome Linked List** and **Reorder List**.

---

## 7. Doubly linked lists

▶ Jenny [2.9 Introduction](https://www.youtube.com/watch?v=nquQ_fYGGA4) · [2.10 Implementation](https://www.youtube.com/watch?v=H8-IuKKiQeo) · [2.11 Insertion](https://www.youtube.com/watch?v=v4szCPs9yEY) · [2.12 Deletion](https://www.youtube.com/watch?v=7yNUXcOcHwE) · [2.13 Reverse](https://www.youtube.com/watch?v=_6JI9XdO8nM)

Each node also stores a `prev` pointer:

```c
struct dnode {
    struct dnode *prev;
    int data;
    struct dnode *next;
};
```

- **Advantages** ([▶ 5:43](https://www.youtube.com/watch?v=nquQ_fYGGA4&t=343s)): you can traverse in both directions, and you can delete a node when you only hold a pointer to it, since its `prev` is right there.
- **Cost** ([▶ 7:28](https://www.youtube.com/watch?v=nquQ_fYGGA4&t=448s)): an extra pointer per node, and every insert or delete must update **four** links instead of two.
- **Keep a `tail` pointer** ([▶ 2.11 at 1:02](https://www.youtube.com/watch?v=v4szCPs9yEY&t=62s)). With it, insertion and deletion at the end are O(1).

**Insert `node` after `p`** (watch the order):

```c
node->prev = p;
node->next = p->next;
if (p->next) p->next->prev = node;   // fix the old neighbour's back-link
p->next = node;
```

**Reverse** ([▶ 2.13 at 3:12](https://www.youtube.com/watch?v=_6JI9XdO8nM&t=192s)): swap `prev` and `next` in every node, then swap `head` and `tail` ([▶ 16:33](https://www.youtube.com/watch?v=_6JI9XdO8nM&t=993s)).

---

## 8. Circular linked lists

▶ Jenny [2.14 Creation & Display](https://www.youtube.com/watch?v=fmfx1C4TTxw) · [2.15 Implementation](https://www.youtube.com/watch?v=jsTybZ5qSNE) · [2.16 Insertion](https://www.youtube.com/watch?v=ReGglEXEH08) · [2.17 Deletion](https://www.youtube.com/watch?v=EkE6RHuMx3I) · [2.18 Reverse](https://www.youtube.com/watch?v=xvAoleV706Q)

The last node points back to the first instead of to `NULL`.

- **Keep only a `tail` pointer** ([▶ 2.15 at 14:01](https://www.youtube.com/watch?v=jsTybZ5qSNE&t=841s)). The head is always `tail->next`, so both ends are reachable in O(1).
  - Insert at the beginning: `node->next = tail->next; tail->next = node;`
  - Insert at the end: do the same, then `tail = node;`
- **Traversal must stop when you return to the start**, not at `NULL`, or it never ends:

```c
if (tail != NULL) {
    struct node *p = tail->next;   // the head
    do {
        printf("%d ", p->data);
        p = p->next;
    } while (p != tail->next);
}
```

- **Uses:** round-robin scheduling, and buffers that loop around, which are the same idea as the circular queue in the Queues tab.

---

## 9. Doubly circular linked lists

▶ Jenny [2.19 Implementation](https://www.youtube.com/watch?v=eBCTtS_sptM) · [2.20 Insertion](https://www.youtube.com/watch?v=Fa958fGdgx0) · [2.21 Deletion](https://www.youtube.com/watch?v=ElQxT6hDeNE)

These combine both ideas: `head->prev` is the last node and `last->next` is the head. Every insertion or deletion updates both directions **and** keeps the loop closed. When inserting at the beginning, remember to also fix `last->next` and `head->prev`.

---

## 10. Exam practice (Neso)

Neso works through six previous-year exam questions on singly linked lists. They're good self-tests on the complexity table above: pause each one and answer before watching.

| Video | Exam |
|---|---|
| [Solved Problem 1](https://www.youtube.com/watch?v=bgtqECHpy8k): cost of insert/delete at the front and end ([▶ chapters](https://www.youtube.com/watch?v=bgtqECHpy8k&t=71s)) | UGC NET CS 2016 |
| [Solved Problem 2](https://www.youtube.com/watch?v=VBxq-gpFWSU) | ISRO CS 2014 |
| [Solved Problem 3](https://www.youtube.com/watch?v=g5533n34-2A) | GATE CS 2010 |
| [Solved Problem 4](https://www.youtube.com/watch?v=z7Q3fd1ylEE) | GATE CS 2008 |
| [Solved Problem 5](https://www.youtube.com/watch?v=WJmFjm_N_mw) | GATE IT 2004 |
| [Solved Problem 6](https://www.youtube.com/watch?v=J_XaK17r6rY) | GATE IT 2003 |
| [Rapid Fire Quiz](https://www.youtube.com/watch?v=7lMlHBOEhag) | 10 quick questions |

---

## Video index

### Jenny's Lectures (21 videos)

| # | Video | Length | Covers |
|---|---|---|---|
| 2.1 | [Introduction to Linked List](https://www.youtube.com/watch?v=dmb1i4oN5oE) | 22:10 | Memory basics → limits of arrays → node structure → traversal → summary |
| 2.2 | [Types of Linked List](https://www.youtube.com/watch?v=DWpVGpNfDmM) | 13:14 | Singly, doubly, circular, doubly circular |
| 2.3 | [Arrays vs Linked List](https://www.youtube.com/watch?v=qauEA64G1Ds) | 21:19 | Access cost, memory use, insert/delete cost, searching |
| 2.4 | [Implementation in C](https://www.youtube.com/watch?v=6wXZ_m3SbEs) | 29:01 | Node struct, `malloc`, building from user input, printing |
| 2.5 | [Insertion](https://www.youtube.com/watch?v=dq3F3e9o2DM) | 27:07 | At beginning, end, after a position |
| 2.6 | [Deletion](https://www.youtube.com/watch?v=ClvYytk5Rlg) | 25:54 | From beginning, end, a position |
| 2.7 | [Find length (iterative)](https://www.youtube.com/watch?v=SbGRuk38MvI) | 5:56 | A `getlength()` function |
| 2.8 | [Reverse (iterative)](https://www.youtube.com/watch?v=Tk_fi5l8cag) | 18:44 | Algorithm, C code, dry run |
| 2.9 | [Doubly Linked List intro](https://www.youtube.com/watch?v=nquQ_fYGGA4) | 8:53 | Representation, advantages, memory cost |
| 2.10 | [Doubly Linked List implementation](https://www.youtube.com/watch?v=H8-IuKKiQeo) | 21:13 | Node, head, creating and displaying |
| 2.11 | [Insertion in DLL](https://www.youtube.com/watch?v=v4szCPs9yEY) | 35:15 | Tail pointer, at beginning/end/position, after a node |
| 2.12 | [Deletion from DLL](https://www.youtube.com/watch?v=7yNUXcOcHwE) | 22:04 | From beginning, end, a position |
| 2.13 | [Reverse a DLL](https://www.youtube.com/watch?v=_6JI9XdO8nM) | 19:34 | Swap links, swap head and tail |
| 2.14 | [Circular Linked List](https://www.youtube.com/watch?v=fmfx1C4TTxw) | 21:29 | Create and display |
| 2.15 | [Circular LL implementation](https://www.youtube.com/watch?v=jsTybZ5qSNE) | 27:48 | Head+tail vs tail-only versions |
| 2.16 | [Insertion in Circular LL](https://www.youtube.com/watch?v=ReGglEXEH08) | 19:45 | At beginning, end, a position |
| 2.17 | [Deletion from Circular LL](https://www.youtube.com/watch?v=EkE6RHuMx3I) | 23:57 | From beginning, end, a position |
| 2.18 | [Reverse a Circular LL](https://www.youtube.com/watch?v=xvAoleV706Q) | 17:32 | Iterative pointer reversal |
| 2.19 | [Doubly Circular LL](https://www.youtube.com/watch?v=eBCTtS_sptM) | 20:27 | Create and display |
| 2.20 | [Insertion in Doubly Circular LL](https://www.youtube.com/watch?v=Fa958fGdgx0) | 25:48 | At beginning, end, a position |
| 2.21 | [Deletion from Doubly Circular LL](https://www.youtube.com/watch?v=ElQxT6hDeNE) | 21:16 | All deletion cases |

### Neso Academy (33 videos)

| # | Video | Length | Covers |
|---|---|---|---|
| 1 | [Introduction to Linked List](https://www.youtube.com/watch?v=R9PTBwOzceo) | 6:21 | Ways to store a list, types, representation |
| 2 | [Array vs. Single Linked List](https://www.youtube.com/watch?v=b5QR4AmrspU) | 4:10 | Storing the same list both ways |
| 3 | [Creating the Node](https://www.youtube.com/watch?v=DneLxrPmmsw) | 6:00 | Self-referential structures, node in C |
| 4–5 | [Creating a List Part 1](https://www.youtube.com/watch?v=nxtDe6Gq4t4) / [Part 2](https://www.youtube.com/watch?v=HrY_YmU1vdg) | 4:36 / 7:00 | Linking the first three nodes |
| 6 | [Counting the Nodes](https://www.youtube.com/watch?v=e0s-zmpedYo) | 6:07 | Traversal to count |
| 7 | [Printing the Data](https://www.youtube.com/watch?v=FIV-0A0mZd8) | 3:44 | Traversal to print |
| 8 | [Traversal vs. Arrays](https://www.youtube.com/watch?v=b7HpuVs3Xi0) | 4:00 | Time complexity comparison |
| 9 | [Insert at the End](https://www.youtube.com/watch?v=LYGbeWnYXd8) | 5:48 | C program |
| 10–11 | [End: List vs. Array Part 1](https://www.youtube.com/watch?v=80gNiLhyr7A) / [Part 2](https://www.youtube.com/watch?v=egUHjERGf88) | 7:35 / 8:06 | Complexity, including a full array |
| 12 | [Insert at the Beginning](https://www.youtube.com/watch?v=jgqg6Qw68_Q) | 5:36 | C program |
| 13 | [Beginning: Possible Mistake](https://www.youtube.com/watch?v=YL8MnLAJOMg) | 5:47 | Passing `head` by value |
| 14 | [Beginning: 2nd Method](https://www.youtube.com/watch?v=90zyJ1eVeUw) | 3:47 | Returning the new head |
| 15 | [Beginning: List vs. Array](https://www.youtube.com/watch?v=IdRq1uz4-t0) | 7:28 | Complexity comparison |
| 16 | [Insert at a Position](https://www.youtube.com/watch?v=0hGxILnKvJk) | 6:52 | C program |
| 17–18 | [Position: List vs. Arrays Part 1](https://www.youtube.com/watch?v=_ajoEqskMHE) / [Part 2](https://www.youtube.com/watch?v=pBbVRIjy3VY) | 3:06 / 8:07 | Complexity comparison |
| 19 | [Delete the First Node](https://www.youtube.com/watch?v=-rcIWx-JTxw) | 3:47 | C program |
| 20 | [Delete the Last Node](https://www.youtube.com/watch?v=TpgxJupHATQ) | 5:05 | Two-pointer version |
| 21 | [Delete Last (single pointer)](https://www.youtube.com/watch?v=8flOSiGsO-g) | 4:00 | One-pointer version |
| 22 | [Deletion at End vs. Array](https://www.youtube.com/watch?v=h0qOcQs-nSw) | 4:25 | Complexity comparison |
| 23 | [Deletion at Beginning vs. Array](https://www.youtube.com/watch?v=AhE22mHckzE) | 4:19 | Complexity comparison |
| 24 | [Delete at a Position](https://www.youtube.com/watch?v=f1r_jxCyOl0) | 9:42 | C program |
| 25 | [Delete the Entire List](https://www.youtube.com/watch?v=ScKTk5GwmG4) | 6:05 | Freeing every node |
| 26 | [Reverse a List](https://www.youtube.com/watch?v=XgABnoJLtG4) | 11:57 | C program |
| 27–32 | Solved Problems 1–6 | 4–8 min each | Exam questions (see section 10) |
| 33 | [Rapid Fire Quiz](https://www.youtube.com/watch?v=7lMlHBOEhag) | 5:23 | 10 quick questions |
