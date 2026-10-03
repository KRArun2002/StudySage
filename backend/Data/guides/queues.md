# Queues: Playlist Study Notes

A study guide for the **[Queue Data Structure](https://www.youtube.com/playlist?list=PL6Zs6LgrJj3uaeVkxa_-Dax_2XdmcfpQb)** playlist by **Dinesh Varyani**: 7 videos, about 3 h 45 min, taught in **Java** with animations. Over half of that time is one two-hour video on priority queues and binary heaps.

> **How these notes were made:** YouTube transcripts weren't available, and these videos' descriptions are generic, so these notes come from the video titles and chapter lists, with the concepts explained here. The ▶ links jump to the relevant video or chapter.

---

## Cheat sheet

| Operation | What it does | Cost |
|---|---|---|
| `enqueue(x)` | Add `x` at the **rear** | O(1) |
| `dequeue()` | Remove and return the **front** | O(1) |
| `peek()` / `first()` | Read the front without removing it | O(1) |
| `isEmpty()` / `size()` | Is it empty? How many elements? | O(1) |

- **FIFO (First In, First Out):** elements leave in the order they arrived, like a checkout line.
- **Two ends:** you add at the **rear** and remove from the **front**. A stack, by contrast, uses only one end.
- **Typical uses:** task scheduling, print queues, buffering data between a producer and a consumer, and **breadth-first search** (level-order traversal of trees, BFS on graphs).

You can try enqueue and dequeue on a circular-buffer queue in the **Interactive Visualizer** tab.

---

## 1. Representing a queue

▶ [How to represent a Queue in Java?](https://www.youtube.com/watch?v=enADmGHZuiY) · [How to implement a Queue in Java? (Part 1)](https://www.youtube.com/watch?v=NkrlOf14GdM)

A queue needs fast access to **both ends**, so an implementation keeps two references: `front`, where elements leave, and `rear`, where they join. It also usually keeps a `length` counter so `size()` is O(1).

There are two common ways to build one:

| | Linked nodes | Circular array |
|---|---|---|
| Capacity | Unbounded | Fixed (or resize when full) |
| Enqueue | Link a new node after `rear` | Write at `(front + size) % capacity` |
| Dequeue | Move `front` to `front.next` | Advance `front = (front + 1) % capacity` |
| Memory | One extra reference per element | No per-element overhead |

> **Why not a plain array with `front` at index 0?** Removing from index 0 would shift every element left, making dequeue O(n). The circular array avoids this by letting `front` move forward and wrap around.

---

## 2. Enqueue and dequeue

▶ [Part 2: Enqueue](https://www.youtube.com/watch?v=ipMDGKu9uNs) · [Part 3: Dequeue](https://www.youtube.com/watch?v=27yOGyZow6U) · or all of it in [Implement a Queue (one video)](https://www.youtube.com/watch?v=sn8BPJGRA8U): class structure [▶ 6:37](https://www.youtube.com/watch?v=sn8BPJGRA8U&t=397s), enqueue [▶ 9:55](https://www.youtube.com/watch?v=sn8BPJGRA8U&t=595s), dequeue [▶ 25:13](https://www.youtube.com/watch?v=sn8BPJGRA8U&t=1513s)

A linked-node queue in Java:

```java
public class Queue {
    private static class ListNode {
        int data;
        ListNode next;
        ListNode(int data) { this.data = data; }
    }

    private ListNode front, rear;
    private int length;

    public boolean isEmpty() { return length == 0; }
    public int size() { return length; }

    public void enqueue(int data) {
        ListNode node = new ListNode(data);
        if (isEmpty()) front = node;    // first element is both front and rear
        else rear.next = node;          // link after the current rear
        rear = node;
        length++;
    }

    public int dequeue() {
        if (isEmpty()) throw new RuntimeException("Queue is empty");
        int result = front.data;
        front = front.next;
        if (front == null) rear = null; // queue became empty: reset rear too
        length--;
        return result;
    }
}
```

**Edge cases that break naive implementations:**

- **Enqueue into an empty queue:** both `front` and `rear` must point to the new node.
- **Dequeue the last element:** `rear` must also become `null`. Otherwise it still points at a removed node, and the next enqueue links onto garbage.
- **Dequeue from an empty queue:** throw an exception or report an error. Don't return a made-up value.

---

## 3. Application: generate binary numbers from 1 to n

▶ [Generate Binary Numbers from 1 to n using a Queue](https://www.youtube.com/watch?v=osF7tb10cUA)

This is a neat use of a queue's FIFO order. Start with `"1"` in the queue. Each time you dequeue a string `s`, print it and enqueue `s + "0"` and `s + "1"`. Because the queue processes strings level by level, they come out in increasing numeric order: 1, 10, 11, 100, 101, …

```java
Queue<String> q = new LinkedList<>();
q.offer("1");
for (int i = 0; i < n; i++) {
    String s = q.poll();
    System.out.println(s);
    q.offer(s + "0");
    q.offer(s + "1");
}
```

This is **breadth-first generation**, the same pattern as level-order traversal in the Trees tab and BFS in the Graphs tab.

---

## 4. Priority queues and binary heaps

▶ [Priority Queue and Binary Heap in One Video](https://www.youtube.com/watch?v=dOynDPicyiI) (2 hours)

A **priority queue** always removes the element with the **highest priority** (max-PQ) or the **lowest** (min-PQ), not the oldest. A **binary heap** is the standard way to implement it.

**Heap properties:**

1. **Shape:** a *complete* binary tree. Every level is full except possibly the last, which fills from the left.
2. **Order:** in a **max-heap**, every parent is ≥ its children, so the maximum is at the root. A **min-heap** is the reverse.

**Stored in an array, with no pointers needed:**

| | 0-based array | 1-based array (index 0 unused) |
|---|---|---|
| Parent of `i` | `(i - 1) / 2` | `i / 2` |
| Left child | `2i + 1` | `2i` |
| Right child | `2i + 2` | `2i + 1` |

Both layouts are common in tutorials, so check which one the video uses before copying formulas.

**Operations:**

| Operation | How | Cost |
|---|---|---|
| Insert | Add at the end, then **swim** (sift up): swap with the parent while it's larger than the parent (max-heap) | O(log n) |
| Remove max/min | Swap the root with the last element, remove it, then **sink** (sift down): swap with the larger child until the order is restored | O(log n) |
| Peek max/min | Read the root | O(1) |
| Build a heap from n items | Sink every non-leaf node from the bottom up | O(n) |

In Java, `java.util.PriorityQueue` is a ready-made **min**-heap. Use `new PriorityQueue<>(Collections.reverseOrder())` for a max-heap.

---

## 5. Queues in the LeetCode tab

| Problem | Queue idea |
|---|---|
| Implement Queue using Stacks | Two stacks: push onto `in`; pop from `out`, refilling it from `in` only when empty (amortized O(1)) |
| Implement Stack using Queues | Rotate the queue after each push so the newest element is at the front |
| Number of Recent Calls | Enqueue timestamps; dequeue the ones older than 3000 ms |
| Design Circular Queue / Deque | The circular-array version from section 1 |
| Time Needed to Buy Tickets | Simulate the line, or count directly |

---

## Video index

| # | Video | Length | Covers |
|---|---|---|---|
| 1 | [How to represent a Queue in Java?](https://www.youtube.com/watch?v=enADmGHZuiY) | 6:41 | What a queue is and how it's represented |
| 2 | [How to implement a Queue in Java? (Part 1)](https://www.youtube.com/watch?v=NkrlOf14GdM) | 5:10 | Setting up the queue class |
| 3 | [Part 2: Enqueue](https://www.youtube.com/watch?v=ipMDGKu9uNs) | 17:12 | Adding at the rear |
| 4 | [Part 3: Dequeue](https://www.youtube.com/watch?v=27yOGyZow6U) | 16:44 | Removing from the front |
| 5 | [Generate Binary Numbers 1 to n](https://www.youtube.com/watch?v=osF7tb10cUA) | 18:38 | A queue application, animated |
| 6 | [Implement a Queue (one video)](https://www.youtube.com/watch?v=sn8BPJGRA8U) | 40:12 | Videos 1–4 combined: intro, class, enqueue, dequeue, final operations |
| 7 | [Priority Queue and Binary Heap](https://www.youtube.com/watch?v=dOynDPicyiI) | 2:00:49 | Heaps, priority queues, animations and implementations |
