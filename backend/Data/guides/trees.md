# Trees: Playlist Study Notes

A study guide for the **[Binary Tree Data Structure](https://www.youtube.com/playlist?list=PL6Zs6LgrJj3vmAOKY6vdN3_0furiZKFvi)** playlist by **Dinesh Varyani**: 20 videos, about 6 hours, taught in **Java**. Most topics come as a pair: an *Animation* video that walks through the algorithm step by step, then an *Implementation* video that codes it.

> **How these notes were made:** YouTube transcripts weren't available, and these videos' descriptions are generic, so these notes come from the video titles and chapter lists, with the concepts explained here. The ▶ links jump to the relevant video or chapter.

---

## Cheat sheet

| Traversal | Order | Recursive | Iterative tool | Typical use |
|---|---|---|---|---|
| **Pre-order** | node → left → right | 3 lines | Stack | Copying or serializing a tree |
| **In-order** | left → node → right | 3 lines | Stack + pointer | **BST → sorted order** |
| **Post-order** | left → right → node | 3 lines | Stack (trickiest) | Deleting a tree, computing heights and sizes |
| **Level-order** | level by level | n/a | **Queue** | Shortest depth, printing by level |

| BST operation | Average (balanced) | Worst (a chain) |
|---|---|---|
| Search, insert, delete | O(log n) | O(n) |

Every traversal visits each node once: **O(n) time**. Recursive and stack-based traversals use **O(h) extra space** (h = height); level-order uses O(width).

The **Interactive Visualizer** tab animates BST insert/search/delete and all four traversals.

---

## 1. What a binary tree is

▶ [How to represent a Binary Tree](https://www.youtube.com/watch?v=mQk6Y5B_0Mk): trees [▶ 0:13](https://www.youtube.com/watch?v=mQk6Y5B_0Mk&t=13s), binary trees [▶ 2:36](https://www.youtube.com/watch?v=mQk6Y5B_0Mk&t=156s), the node [▶ 4:24](https://www.youtube.com/watch?v=mQk6Y5B_0Mk&t=264s) · [How to Implement a Binary Tree](https://www.youtube.com/watch?v=wL7JOLxbMI4)

- A **tree** is a hierarchy of nodes. Its vocabulary:
  - **root:** the top node.
  - **parent / child:** a node and the nodes directly below it.
  - **leaf:** a node with no children.
  - **height:** the longest path from the root down to a leaf.
- In a **binary tree**, each node has at most **two** children, `left` and `right`.

```java
public class BinaryTree {
    private TreeNode root;

    private static class TreeNode {
        int data;
        TreeNode left, right;
        TreeNode(int data) { this.data = data; }
    }
}
```

The implementation video builds a small tree by hand, creating nodes and wiring up their `left` and `right` references.

---

## 2. Depth-first traversals: recursive

▶ [Recursive Pre-order](https://www.youtube.com/watch?v=R4V4n-waxn4) · [Recursive In-order](https://www.youtube.com/watch?v=vpXcceCmSbg) · [Recursive Post-order](https://www.youtube.com/watch?v=xDMFBKjxZNc) (algorithm walkthrough at [▶ 1:40](https://www.youtube.com/watch?v=xDMFBKjxZNc&t=100s))

The three traversals are the same function. Only the position of the "visit" line changes:

```java
void preOrder(TreeNode root) {
    if (root == null) return;
    System.out.print(root.data + " ");   // visit FIRST
    preOrder(root.left);
    preOrder(root.right);
}

void inOrder(TreeNode root) {
    if (root == null) return;
    inOrder(root.left);
    System.out.print(root.data + " ");   // visit in the MIDDLE
    inOrder(root.right);
}

void postOrder(TreeNode root) {
    if (root == null) return;
    postOrder(root.left);
    postOrder(root.right);
    System.out.print(root.data + " ");   // visit LAST
}
```

**Try it:** for a BST built from 50, 30, 70, 20, 40, 60, 80:

- pre-order gives `50 30 20 40 70 60 80`
- in-order gives `20 30 40 50 60 70 80` (sorted)
- post-order gives `20 40 30 60 80 70 50`

The Animation videos trace the **call stack** as the recursion goes down and comes back up, which is the key to understanding these traversals.

---

## 3. Depth-first traversals: iterative

Recursion uses the call stack implicitly. The iterative versions manage an explicit `Stack<TreeNode>` instead.

### Pre-order

▶ [Iterative Pre-order](https://www.youtube.com/watch?v=VaIaJMeNWtU): the algorithm [▶ 1:05](https://www.youtube.com/watch?v=VaIaJMeNWtU&t=65s), step by step [▶ 2:08](https://www.youtube.com/watch?v=VaIaJMeNWtU&t=128s)

Pop a node and visit it. Then push its **right** child before its **left**, so the left child is popped first.

```java
Stack<TreeNode> stack = new Stack<>();
stack.push(root);
while (!stack.isEmpty()) {
    TreeNode node = stack.pop();
    System.out.print(node.data + " ");
    if (node.right != null) stack.push(node.right);
    if (node.left != null) stack.push(node.left);
}
```

### In-order

▶ [Iterative In-order](https://www.youtube.com/watch?v=uMTrIjP_0Gw): the algorithm [▶ 1:53](https://www.youtube.com/watch?v=uMTrIjP_0Gw&t=113s)

Go left as far as possible, pushing nodes as you go. When you can't go further left, pop a node, visit it, then step into its right subtree.

```java
Stack<TreeNode> stack = new Stack<>();
TreeNode curr = root;
while (curr != null || !stack.isEmpty()) {
    while (curr != null) { stack.push(curr); curr = curr.left; }
    curr = stack.pop();
    System.out.print(curr.data + " ");
    curr = curr.right;
}
```

### Post-order

▶ [Iterative Post-order (Animation)](https://www.youtube.com/watch?v=uigaktgcQWU) · [Implementation](https://www.youtube.com/watch?v=m4Wb3kXk_iA)

This is the hardest of the three. A node may only be visited **after both of its subtrees**, so when you return to a node you must know whether you're coming back from the left or from the right. One common single-stack version remembers the last node visited:

```java
Stack<TreeNode> stack = new Stack<>();
TreeNode curr = root, lastVisited = null;
while (curr != null || !stack.isEmpty()) {
    while (curr != null) { stack.push(curr); curr = curr.left; }
    TreeNode top = stack.peek();
    if (top.right != null && top.right != lastVisited) {
        curr = top.right;                 // right subtree not done yet
    } else {
        System.out.print(top.data + " ");
        lastVisited = stack.pop();        // both subtrees done
    }
}
```

The videos use their own variant, so follow the Animation video to see how it tracks progress.

---

## 4. Level-order traversal (breadth-first)

▶ [Level order traversal](https://www.youtube.com/watch?v=hXAqTO7VqUQ)

Use a **queue**: dequeue a node, visit it, then enqueue its children. FIFO order guarantees that you finish one level before starting the next.

```java
Queue<TreeNode> queue = new LinkedList<>();
queue.offer(root);
while (!queue.isEmpty()) {
    TreeNode node = queue.poll();
    System.out.print(node.data + " ");
    if (node.left != null) queue.offer(node.left);
    if (node.right != null) queue.offer(node.right);
}
```

This is the same breadth-first idea as BFS on graphs. LeetCode practice: **Binary Tree Level Order Traversal**.

---

## 5. Recursive problem: maximum value

▶ [Find the Maximum (Animation)](https://www.youtube.com/watch?v=XZZbTtLUGiM) · [Implementation](https://www.youtube.com/watch?v=XptQUEqKYTc)

A binary tree (unlike a BST) has no ordering, so the maximum could be anywhere. Take the largest of the node itself, the maximum of its left subtree and the maximum of its right subtree:

```java
int findMax(TreeNode root) {
    if (root == null) return Integer.MIN_VALUE;
    int result = root.data;
    result = Math.max(result, findMax(root.left));
    result = Math.max(result, findMax(root.right));
    return result;
}
```

The same pattern answers **height**, **size** and **sum**: combine the answers from both subtrees with the node's own value. LeetCode practice: **Maximum Depth of Binary Tree** and **Diameter of Binary Tree**.

---

## 6. Binary search trees (BST)

▶ Representation: [Animation](https://www.youtube.com/watch?v=B1Mau6NCHx0), [Implementation](https://www.youtube.com/watch?v=_JcH9H9TVcY) · Insert: [Animation](https://www.youtube.com/watch?v=B2g1shI0pbk), [Implementation](https://www.youtube.com/watch?v=ZHLAiHiYgeI) · Search: [Animation](https://www.youtube.com/watch?v=n1fnwWfgcvY), [Implementation](https://www.youtube.com/watch?v=wL1oxXrEgr4)

**The BST rule:** for every node, all keys in its **left** subtree are **smaller** and all keys in its **right** subtree are **larger**. Each comparison throws away half of the remaining tree, at least when the tree is balanced.

**Insert (recursive):** walk left or right by comparing keys, and attach the new node at the empty spot you reach.

```java
TreeNode insert(TreeNode root, int value) {
    if (root == null) return new TreeNode(value);
    if (value < root.data) root.left = insert(root.left, value);
    else root.right = insert(root.right, value);
    return root;
}
```

**Search (recursive):**

```java
TreeNode search(TreeNode root, int key) {
    if (root == null || root.data == key) return root;
    return key < root.data ? search(root.left, key) : search(root.right, key);
}
```

> **Shape matters.** Inserting already-sorted keys (1, 2, 3, 4…) produces a "tree" that's really a linked list, and every operation degrades to O(n). Self-balancing trees (AVL, red-black) fix this. They're not covered in this playlist.

---

## 7. Interview problems

### Validate Binary Search Tree (LeetCode #98)

▶ [Validate BST](https://www.youtube.com/watch?v=ACoLBU0nPAw)

**The trap:** checking only that `left < node < right` for each parent and its children isn't enough. Every node must fit the bounds set by **all** of its ancestors. Pass a valid `(min, max)` range down the tree:

```java
boolean isValid(TreeNode root, long min, long max) {
    if (root == null) return true;
    if (root.data <= min || root.data >= max) return false;
    return isValid(root.left, min, root.data) && isValid(root.right, root.data, max);
}
// isValid(root, Long.MIN_VALUE, Long.MAX_VALUE)
```

An alternative is to check that an in-order traversal is strictly increasing.

### Symmetric Tree (LeetCode #101)

▶ [Symmetric Tree](https://www.youtube.com/watch?v=lStz4y5Cq4c)

A tree is symmetric if its left and right subtrees are **mirror images**. Compare the *outer* pair of children and the *inner* pair:

```java
boolean isMirror(TreeNode a, TreeNode b) {
    if (a == null || b == null) return a == b;
    return a.data == b.data && isMirror(a.left, b.right) && isMirror(a.right, b.left);
}
// isSymmetric(root) = root == null || isMirror(root.left, root.right)
```

Both problems are in the LeetCode Practice tab, along with Same Tree, Invert Binary Tree and Kth Smallest Element in a BST (hint: in-order traversal).

---

## Video index

| # | Video | Length | Covers |
|---|---|---|---|
| 1 | [Represent a Binary Tree](https://www.youtube.com/watch?v=mQk6Y5B_0Mk) | 8:19 | Trees, binary trees, the node, demo |
| 2 | [Implement a Binary Tree](https://www.youtube.com/watch?v=wL7JOLxbMI4) | 7:46 | Building a tree in Java |
| 3 | [Recursive Pre-order](https://www.youtube.com/watch?v=R4V4n-waxn4) | 26:05 | node → left → right, with the call stack |
| 4 | [Iterative Pre-order](https://www.youtube.com/watch?v=VaIaJMeNWtU) | 16:34 | With an explicit stack |
| 5 | [Recursive In-order](https://www.youtube.com/watch?v=vpXcceCmSbg) | 26:57 | left → node → right |
| 6 | [Iterative In-order](https://www.youtube.com/watch?v=uMTrIjP_0Gw) | 28:43 | Stack plus a current pointer |
| 7 | [Recursive Post-order](https://www.youtube.com/watch?v=xDMFBKjxZNc) | 26:46 | left → right → node |
| 8 | [Iterative Post-order (Animation)](https://www.youtube.com/watch?v=uigaktgcQWU) | 27:56 | The tricky one, step by step |
| 9 | [Iterative Post-order (Implementation)](https://www.youtube.com/watch?v=m4Wb3kXk_iA) | 14:34 | Java code |
| 10 | [Level-order traversal](https://www.youtube.com/watch?v=hXAqTO7VqUQ) | 18:35 | Breadth-first with a queue |
| 11 | [Find Maximum (Animation)](https://www.youtube.com/watch?v=XZZbTtLUGiM) | 26:20 | Recursive max |
| 12 | [Find Maximum (Implementation)](https://www.youtube.com/watch?v=XptQUEqKYTc) | 9:23 | Java code |
| 13 | [Represent a BST (Animation)](https://www.youtube.com/watch?v=B1Mau6NCHx0) | 10:07 | The BST ordering rule |
| 14 | [Represent a BST (Implementation)](https://www.youtube.com/watch?v=_JcH9H9TVcY) | 3:05 | Java class |
| 15 | [Insert into a BST (Animation)](https://www.youtube.com/watch?v=B2g1shI0pbk) | 19:47 | Recursive insert |
| 16 | [Insert into a BST (Implementation)](https://www.youtube.com/watch?v=ZHLAiHiYgeI) | 7:22 | Java code |
| 17 | [Search a BST (Animation)](https://www.youtube.com/watch?v=n1fnwWfgcvY) | 18:29 | Recursive search |
| 18 | [Search a BST (Implementation)](https://www.youtube.com/watch?v=wL1oxXrEgr4) | 6:39 | Java code |
| 19 | [Validate BST (LeetCode #98)](https://www.youtube.com/watch?v=ACoLBU0nPAw) | 33:57 | Min/max bounds |
| 20 | [Symmetric Tree (LeetCode #101)](https://www.youtube.com/watch?v=lStz4y5Cq4c) | 22:01 | Mirror comparison |
