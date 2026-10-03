# Graphs: Playlist Study Notes

A study guide for the **[Graph Theory](https://www.youtube.com/playlist?list=PLDV1Zeh2NRsDGO4--qE8yH72HFL1Km93P)** playlist by **WilliamFiset**: 43 videos, about 8 h 15 min. Many topics come as a pair: an explanation video with animations, then a **source code** video in Java.

> **How these notes were made:** YouTube transcripts weren't available, so these notes come from each video's title, description and (very detailed) chapter list, with the concepts explained here. The ▶ links jump to the matching chapter.

**What to study first.** This playlist runs from the basics to competitive-programming level. For this course, the essentials are:

- ⭐ **Core:** sections 1–4 (representation, DFS, BFS, grids), then 6 (topological sort) and 7 (Dijkstra)
- **Next step:** sections 5, 8 and 9 (tree algorithms, other shortest paths, minimum spanning trees)
- **Advanced:** sections 10–12 (SCCs, Euler paths, TSP, network flow). Read these for interest or competitive programming.

---

## Cheat sheet

| Algorithm | Solves | Works on | Time |
|---|---|---|---|
| **DFS** | Reachability, connected components, cycle detection | Any graph | O(V + E) |
| **BFS** | Shortest path by number of edges | **Unweighted** graphs | O(V + E) |
| **Topological sort** (DFS or Kahn's) | An order that respects dependencies | **DAGs** only | O(V + E) |
| **DAG shortest/longest path** | Path weights on a DAG | DAGs, negative weights OK | O(V + E) |
| **Dijkstra** | Single-source shortest paths | **Non-negative** weights | O(E log V) with a binary heap |
| **Bellman-Ford** | Single-source shortest paths; **detects negative cycles** | Any weights | O(V · E) |
| **Floyd-Warshall** | **All-pairs** shortest paths | Any weights (detects negative cycles) | O(V³) |
| **Tarjan** | Strongly connected components | Directed graphs | O(V + E) |
| **Prim** | Minimum spanning tree | Undirected, weighted | O(E log V) |
| **Hierholzer** | Eulerian path or circuit (every edge once) | Graphs meeting the degree conditions | O(E) |
| **TSP (DP)** | Cheapest tour visiting every node once | Small graphs (n ≲ 20) | O(n² · 2ⁿ) |
| **Ford-Fulkerson / Edmonds-Karp / Dinic** | Maximum flow, bipartite matching | Flow networks | Edmonds-Karp O(V · E²), Dinic O(V² · E) |

**Choosing a shortest-path algorithm:**

- **Unweighted graph:** BFS.
- **DAG:** topological sort plus relaxation.
- **Non-negative weights:** Dijkstra.
- **Negative weights, or need to detect negative cycles:** Bellman-Ford.
- **Every pair of nodes, small graph:** Floyd-Warshall.

You can run BFS and DFS step by step in the **Interactive Visualizer** tab.

---

## 1. ⭐ Graph basics and representation

▶ [Graph Theory Algorithms](https://www.youtube.com/watch?v=DgXR2OWQnLc) (series trailer) · [Graph Theory Introduction](https://www.youtube.com/watch?v=eQA-m22wjTQ) · [Overview of Algorithms](https://www.youtube.com/watch?v=87X57ldq1ok)

**Types of graph** (▶ Introduction):

| Type | Meaning |
|---|---|
| [Undirected](https://www.youtube.com/watch?v=eQA-m22wjTQ&t=163s) / [Directed](https://www.youtube.com/watch?v=eQA-m22wjTQ&t=194s) | Whether edges are one-way |
| [Weighted](https://www.youtube.com/watch?v=eQA-m22wjTQ&t=248s) | Edges carry a cost, distance or capacity |
| [Tree](https://www.youtube.com/watch?v=eQA-m22wjTQ&t=307s) | Connected, no cycles, exactly V − 1 edges |
| [DAG](https://www.youtube.com/watch?v=eQA-m22wjTQ&t=374s) | Directed with no cycles. Models dependencies |
| [Bipartite](https://www.youtube.com/watch?v=eQA-m22wjTQ&t=440s) | Nodes split into two groups; every edge goes between the groups |
| [Complete](https://www.youtube.com/watch?v=eQA-m22wjTQ&t=505s) | Every pair of nodes is connected |

**Storing a graph:**

| Representation | Space | Check edge (u, v) | List neighbours | Best for |
|---|---|---|---|---|
| [Adjacency matrix](https://www.youtube.com/watch?v=eQA-m22wjTQ&t=570s) | O(V²) | O(1) | O(V) | Dense graphs, Floyd-Warshall |
| [Adjacency list](https://www.youtube.com/watch?v=eQA-m22wjTQ&t=682s) | O(V + E) | O(degree) | O(degree) | **Most problems** (sparse graphs) |
| [Edge list](https://www.youtube.com/watch?v=eQA-m22wjTQ&t=773s) | O(E) | O(E) | O(E) | Bellman-Ford, Kruskal |

**The problems in the rest of the playlist** (▶ Overview): [shortest path](https://www.youtube.com/watch?v=87X57ldq1ok&t=69s), [connectivity](https://www.youtube.com/watch?v=87X57ldq1ok&t=115s), [negative cycles](https://www.youtube.com/watch?v=87X57ldq1ok&t=147s), [SCCs](https://www.youtube.com/watch?v=87X57ldq1ok&t=243s), [TSP](https://www.youtube.com/watch?v=87X57ldq1ok&t=288s), [bridges and articulation points](https://www.youtube.com/watch?v=87X57ldq1ok&t=350s), [MST](https://www.youtube.com/watch?v=87X57ldq1ok&t=402s) and [network flow](https://www.youtube.com/watch?v=87X57ldq1ok&t=473s).

---

## 2. ⭐ Depth-first search (DFS)

▶ [Depth First Search Algorithm](https://www.youtube.com/watch?v=7fujbpJ0LB4): pseudocode [▶ 3:30](https://www.youtube.com/watch?v=7fujbpJ0LB4&t=210s), connected components [▶ 5:10](https://www.youtube.com/watch?v=7fujbpJ0LB4&t=310s), other uses [▶ 9:27](https://www.youtube.com/watch?v=7fujbpJ0LB4&t=567s)

DFS goes **as deep as possible** along one path, then **backtracks**. It's a template that many other algorithms build on.

```java
void dfs(int at) {
    if (visited[at]) return;
    visited[at] = true;
    for (int next : graph.get(at)) dfs(next);
}
```

**Connected components:** loop over every node. Each time you find an unvisited one, start a DFS from it and give every node it reaches the same component id. The number of DFS starts is the number of components.

**Other uses:** cycle detection, topological sort, bridges and articulation points, strongly connected components, and maze solving.

LeetCode practice: **Number of Islands**, **Number of Provinces**, **Keys and Rooms**, **Find if Path Exists in Graph**.

---

## 3. ⭐ Breadth-first search (BFS)

▶ [Breadth First Search Algorithm](https://www.youtube.com/watch?v=oDqjPvD54Ss): pseudocode [▶ 3:33](https://www.youtube.com/watch?v=oDqjPvD54Ss&t=213s), reconstructing the path [▶ 6:04](https://www.youtube.com/watch?v=oDqjPvD54Ss&t=364s)

BFS explores in **layers**: all nodes 1 edge away, then 2 edges away, and so on, using a **queue**. Because of that, the first time BFS reaches a node is along a **shortest path (fewest edges)**.

```java
int[] prev = new int[n];
Arrays.fill(prev, -1);
boolean[] visited = new boolean[n];
Queue<Integer> queue = new ArrayDeque<>();
queue.add(start);
visited[start] = true;

while (!queue.isEmpty()) {
    int node = queue.poll();
    for (int next : graph.get(node)) {
        if (!visited[next]) {
            visited[next] = true;   // mark when ENQUEUED, not when dequeued
            prev[next] = node;      // remember how we got here
            queue.add(next);
        }
    }
}
// Reconstruct the path: follow prev[] back from the end to the start, then reverse it.
```

> BFS gives shortest paths only on **unweighted** graphs. With weights, use Dijkstra (section 7).

LeetCode practice: **Rotting Oranges** (BFS from several starting points at once) and **Clone Graph**.

---

## 4. ⭐ BFS on a grid

▶ [BFS Grid Shortest Path](https://www.youtube.com/watch?v=KiCBXu4P-2Y): direction vectors [▶ 3:55](https://www.youtube.com/watch?v=KiCBXu4P-2Y&t=235s), the Dungeon problem [▶ 6:09](https://www.youtube.com/watch?v=KiCBXu4P-2Y&t=369s), separate queues for row and column [▶ 9:12](https://www.youtube.com/watch?v=KiCBXu4P-2Y&t=552s)

A grid is an **implicit graph**. Each cell is a node, and its neighbours are the cells up, down, left and right that aren't walls. You don't need to build an adjacency list; generate neighbours on the fly with **direction vectors**:

```java
int[] dr = {-1, 1, 0, 0};
int[] dc = {0, 0, 1, -1};
for (int i = 0; i < 4; i++) {
    int r = row + dr[i], c = col + dc[i];
    if (r < 0 || c < 0 || r >= rows || c >= cols) continue;    // off the grid
    if (visited[r][c] || grid[r][c] == '#') continue;          // seen or a wall
    visited[r][c] = true;
    rowQueue.add(r);
    colQueue.add(c);
}
```

To count steps, process the queue **one layer at a time**, or store the distance alongside each cell. LeetCode practice: **Flood Fill**, **Rotting Oranges** and **Number of Islands**.

---

## 5. Tree algorithms

▶ [Introduction to Tree Algorithms](https://www.youtube.com/watch?v=1XC3p2zBK34) · [Beginner Tree Algorithms](https://www.youtube.com/watch?v=0qgaIMqOEVs) · [Rooting a Tree](https://www.youtube.com/watch?v=2FFq2_je7Lg) · [Tree Center(s)](https://www.youtube.com/watch?v=nzF_9bjDzdc) · Isomorphic Trees: [explanation](https://www.youtube.com/watch?v=OCKvEMF0Xac), [code](https://www.youtube.com/watch?v=40Jx-at2P5k) · LCA: [explanation](https://www.youtube.com/watch?v=sD1IoalFomA), [code](https://www.youtube.com/watch?v=rA7JJG7x9vs)

A tree is just a connected, acyclic graph, so the graph techniques above apply.

- **Storing trees** ([▶ 3:08](https://www.youtube.com/watch?v=1XC3p2zBK34&t=188s)): as an adjacency list, the same as a graph. A **rooted** tree can instead give each node a list of its children plus a parent pointer ([▶ 7:05](https://www.youtube.com/watch?v=1XC3p2zBK34&t=425s)).
- **Leaf sum and height** ([▶ 0:40](https://www.youtube.com/watch?v=0qgaIMqOEVs&t=40s), [▶ 3:32](https://www.youtube.com/watch?v=0qgaIMqOEVs&t=212s)): simple recursions. Height is `1 + max(height of each child)`.
- **Rooting a tree** ([▶ 2:18](https://www.youtube.com/watch?v=2FFq2_je7Lg&t=138s)): DFS from the chosen root, recording each node's parent. Don't walk back to the parent.
- **Tree center(s):** repeatedly remove all leaves, like peeling an onion. The last one or two nodes left are the center. Rooting at the center gives the smallest height.
- **Isomorphic trees** ([▶ encoding 5:39](https://www.youtube.com/watch?v=OCKvEMF0Xac&t=339s)): are two trees the same shape? Root both at their centers, encode each one canonically as a string by sorting the children's encodings, and compare the strings.
- **Lowest common ancestor (LCA):** the deepest node that is an ancestor of both `u` and `v`. Fiset's method records an **Euler tour**, the order a DFS visits nodes ([▶ 4:40](https://www.youtube.com/watch?v=sD1IoalFomA&t=280s)). The LCA is then the shallowest node in the tour between `u` and `v`, which a sparse table answers in O(1) per query.

For a binary *search* tree, LCA is simpler: walk down from the root until `u` and `v` fall on different sides. That's the LeetCode problem in the Trees tab.

---

## 6. ⭐ Topological sort

▶ [Topological Sort Algorithm](https://www.youtube.com/watch?v=eL-KzMXSXXI): the DFS-based algorithm [▶ 5:26](https://www.youtube.com/watch?v=eL-KzMXSXXI&t=326s) · [Kahn's Algorithm](https://www.youtube.com/watch?v=cIBFEhD77b4): intuition [▶ 5:36](https://www.youtube.com/watch?v=cIBFEhD77b4&t=336s), pseudocode [▶ 11:15](https://www.youtube.com/watch?v=cIBFEhD77b4&t=675s)

A **topological ordering** lists nodes so that every edge `u → v` has `u` before `v`. Examples: course prerequisites, build systems, task scheduling. It exists **only if there's no cycle**, which means only for a DAG.

**Kahn's algorithm** (BFS-style):

1. Count each node's **in-degree**, the number of incoming edges.
2. Enqueue every node with in-degree 0.
3. Repeatedly dequeue a node, append it to the order, and decrement its neighbours' in-degrees. Enqueue any neighbour whose in-degree reaches 0.
4. If the order has fewer than V nodes, **the graph has a cycle**.

**The DFS version:** when a node *finishes* (all its descendants are done), add it to the front of the order.

LeetCode practice: **Course Schedule** ("can you finish every course?" is the same as asking whether a topological order exists).

### Shortest or longest path on a DAG

▶ [Shortest/Longest Path on a DAG](https://www.youtube.com/watch?v=TXkDpqjDMHA) (longest path at [▶ 5:45](https://www.youtube.com/watch?v=TXkDpqjDMHA&t=345s))

Process nodes in topological order, **relaxing** each outgoing edge: `dist[v] = min(dist[v], dist[u] + w)`. This is O(V + E) and handles negative edges. For the **longest** path, negate the weights (or use `max`). On a general graph, longest path is NP-hard.

---

## 7. ⭐ Dijkstra's shortest path

▶ [Dijkstra's Algorithm](https://www.youtube.com/watch?v=pSqmAO-m7Lk) · [Source Code](https://www.youtube.com/watch?v=mbLzxKUeLJ4)

This finds single-source shortest paths when **every edge weight is ≥ 0**. It always expands the closest node it hasn't finalized yet, using a priority queue.

**Lazy Dijkstra** ([▶ 3:50](https://www.youtube.com/watch?v=pSqmAO-m7Lk&t=230s)):

```java
double[] dist = new double[n];
Arrays.fill(dist, Double.POSITIVE_INFINITY);
dist[start] = 0;
PriorityQueue<double[]> pq = new PriorityQueue<>(Comparator.comparingDouble(entry -> entry[1]));
pq.add(new double[] {start, 0});

while (!pq.isEmpty()) {
    double[] entry = pq.poll();
    int node = (int) entry[0];
    if (entry[1] > dist[node]) continue;          // stale entry: skip it
    for (Edge e : graph.get(node)) {
        double candidate = dist[node] + e.cost;
        if (candidate < dist[e.to]) {
            dist[e.to] = candidate;
            pq.add(new double[] {e.to, candidate});   // "lazy": duplicates are allowed
        }
    }
}
```

**Optimizations covered:**

- **Skipping stale entries** ([▶ 11:33](https://www.youtube.com/watch?v=pSqmAO-m7Lk&t=693s)).
- **Stopping early** once the target is popped ([▶ 14:01](https://www.youtube.com/watch?v=pSqmAO-m7Lk&t=841s)).
- **Eager Dijkstra** with an *indexed* priority queue that updates keys instead of adding duplicates ([▶ 15:11](https://www.youtube.com/watch?v=pSqmAO-m7Lk&t=911s)).
- **D-ary heaps** ([▶ 20:31](https://www.youtube.com/watch?v=pSqmAO-m7Lk&t=1231s)).

> **Why negative edges break it:** Dijkstra treats a node's distance as final once it's popped. A negative edge found later could make that path cheaper.

---

## 8. Other shortest-path algorithms

### Bellman-Ford

▶ [Bellman Ford Algorithm](https://www.youtube.com/watch?v=lyw4FaxrwHg): negative cycles [▶ 2:02](https://www.youtube.com/watch?v=lyw4FaxrwHg&t=122s), steps [▶ 4:05](https://www.youtube.com/watch?v=lyw4FaxrwHg&t=245s)

Relax **every edge**, V − 1 times. Then run one more round: any distance that can still decrease is affected by a **negative cycle**, so mark it as −∞. This takes O(V · E), which is slower than Dijkstra, but it handles negative weights.

### Floyd-Warshall

▶ [Floyd-Warshall](https://www.youtube.com/watch?v=4NQ3HnhyNfQ): main concept [▶ 3:20](https://www.youtube.com/watch?v=4NQ3HnhyNfQ&t=200s), pseudocode [▶ 8:30](https://www.youtube.com/watch?v=4NQ3HnhyNfQ&t=510s), negative cycles [▶ 11:36](https://www.youtube.com/watch?v=4NQ3HnhyNfQ&t=696s) · [Source Code](https://www.youtube.com/watch?v=0dTrKG5UK9k)

A dynamic-programming solution for **all pairs** at once. Note the loop order:

```java
for (int k = 0; k < n; k++)          // allow node k as an intermediate stop
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
            if (dp[i][k] + dp[k][j] < dp[i][j])
                dp[i][j] = dp[i][k] + dp[k][j];
```

`k` must be the **outermost** loop. If any `dp[i][i]` ends up negative, node `i` is on a negative cycle.

---

## 9. Minimum spanning trees (Prim's algorithm)

▶ [Prim's MST](https://www.youtube.com/watch?v=jsmMtJpPnhU): what an MST is [▶ 0:27](https://www.youtube.com/watch?v=jsmMtJpPnhU&t=27s), lazy version [▶ 3:44](https://www.youtube.com/watch?v=jsmMtJpPnhU&t=224s) · [Eager Prim's](https://www.youtube.com/watch?v=xq3ABa-px_g) ([▶ 2:13](https://www.youtube.com/watch?v=xq3ABa-px_g&t=133s)) · [Eager Prim's Source Code](https://www.youtube.com/watch?v=CI5Fvk-dGVs)

A **minimum spanning tree** connects **all** nodes using V − 1 edges with the **lowest total weight**. Think of the cheapest way to cable every house together.

**Prim's algorithm:** grow the tree from any node, always adding the **cheapest edge that leaves the tree** (taken from a priority queue). If an edge leads to a node that's already in the tree, ignore it, because it would create a cycle. *Lazy* Prim's leaves stale edges in the queue; *eager* Prim's uses an indexed priority queue that tracks only the best edge to each node.

---

## 10. Advanced: strongly connected components and Euler paths

### Tarjan's SCC algorithm

▶ [Tarjan's SCC](https://www.youtube.com/watch?v=wUgWX0nc4NY): what SCCs are [▶ 0:23](https://www.youtube.com/watch?v=wUgWX0nc4NY&t=23s), the algorithm [▶ 4:55](https://www.youtube.com/watch?v=wUgWX0nc4NY&t=295s), pseudocode [▶ 12:21](https://www.youtube.com/watch?v=wUgWX0nc4NY&t=741s) · [Source Code](https://www.youtube.com/watch?v=hKhLj7bfDKk)

In a directed graph, a **strongly connected component** is a maximal group of nodes that can all reach each other. Tarjan's algorithm finds every SCC in **one DFS**. It tracks each node's discovery id and the smallest id it can reach (its "low-link") while keeping a stack of the current path. When a node's low-link equals its own id, everything above it on the stack forms one SCC.

### Eulerian paths and circuits

▶ [Existence of Eulerian Paths](https://www.youtube.com/watch?v=xR4sGgwtR2I) (degree rules at [▶ 3:11](https://www.youtube.com/watch?v=xR4sGgwtR2I&t=191s)) · [Hierholzer's Algorithm](https://www.youtube.com/watch?v=8MpoO2zA2l4) · [Source Code](https://www.youtube.com/watch?v=QQ3jO1dKjYQ)

An **Eulerian path** uses **every edge exactly once**; an **Eulerian circuit** also ends where it started.

| | Circuit exists if… | Path exists if… |
|---|---|---|
| Undirected | Every node has **even** degree | Exactly **0 or 2** nodes have odd degree |
| Directed | in-degree = out-degree for every node | At most one node has out − in = 1 (the start), at most one has in − out = 1 (the end), and all others are balanced |

The edges must also form a single connected piece. **Hierholzer's algorithm** finds the path in O(E). Start from a valid node and DFS along unused edges, adding each node to the front of the answer as you **backtrack** ([▶ 6:44](https://www.youtube.com/watch?v=8MpoO2zA2l4&t=404s)).

---

## 11. Advanced: the traveling salesman problem

▶ [TSP with Dynamic Programming](https://www.youtube.com/watch?v=cY4HiiFHO1o): brute force vs. DP [▶ 1:43](https://www.youtube.com/watch?v=cY4HiiFHO1o&t=103s), representing visited nodes [▶ 6:33](https://www.youtube.com/watch?v=cY4HiiFHO1o&t=393s), reconstructing the tour [▶ 17:58](https://www.youtube.com/watch?v=cY4HiiFHO1o&t=1078s) · [Source Code](https://www.youtube.com/watch?v=udEe7Cv3DqU)

The problem: find the cheapest route that visits every node exactly once and returns to the start. Brute force tries all **n!** orders. The DP stores `memo[end][visitedSet]` = the cheapest path that visits exactly `visitedSet` and ends at `end`. The set is a **bitmask**, where bit i = 1 means node i has been visited. This brings the cost down to **O(n² · 2ⁿ)**, which is practical up to about 20 nodes.

---

## 12. Advanced: network flow

▶ Ford-Fulkerson: [explanation](https://www.youtube.com/watch?v=LdOnanfc5TM), [code](https://www.youtube.com/watch?v=Xu8jjJnwvxE) · Bipartite matching: [unweighted](https://www.youtube.com/watch?v=GhjwOiJ4SqU), [Mice and Owls](https://www.youtube.com/watch?v=ar6x7dHfGHA), [Elementary Math](https://www.youtube.com/watch?v=zrGnYstL4ss) · Edmonds-Karp: [explanation](https://www.youtube.com/watch?v=RppuJYwlcI8), [code](https://www.youtube.com/watch?v=OViaWp9Q-Oc) · Capacity scaling: [explanation](https://www.youtube.com/watch?v=1ewLrXUz4kk), [code](https://www.youtube.com/watch?v=hZqiLIaIEFg) · Dinic: [explanation](https://www.youtube.com/watch?v=M6cm8UeeziI), [code](https://www.youtube.com/watch?v=_SdF4KK_dyM)

**Maximum flow:** each edge has a **capacity**. How much can flow from the source **s** to the sink **t**?

- **Ford-Fulkerson** ([▶ residual graph 4:26](https://www.youtube.com/watch?v=LdOnanfc5TM&t=266s)): repeatedly find an **augmenting path** from s to t with spare capacity, and push as much flow as the path's bottleneck allows. **Residual (backward) edges** let later paths undo earlier choices. With DFS, this takes O(E · f), where f is the max flow ([▶ 9:49](https://www.youtube.com/watch?v=LdOnanfc5TM&t=589s)).
- **Faster variants** change *which* augmenting path to use:

| Algorithm | Picks | Time |
|---|---|---|
| **Edmonds-Karp** ([▶ 1:30](https://www.youtube.com/watch?v=RppuJYwlcI8&t=90s)) | The **shortest** augmenting path, found with BFS | O(V · E²) |
| **Capacity scaling** ([▶ 3:17](https://www.youtube.com/watch?v=1ewLrXUz4kk&t=197s)) | Large-capacity paths first | O(E² log U) |
| **Dinic's** ([▶ level graph 7:22](https://www.youtube.com/watch?v=M6cm8UeeziI&t=442s)) | BFS builds a **level graph**; DFS then sends a "blocking flow" through it | O(V² · E) |

- **Bipartite matching** ([▶ 4:13](https://www.youtube.com/watch?v=GhjwOiJ4SqU&t=253s)): matching people to jobs, or mice to holes, is a max-flow problem. Connect the source to the left side and the right side to the sink, give every edge capacity 1, and the max flow equals the maximum number of matched pairs.

---

## Video index

| # | Video | Length | Level |
|---|---|---|---|
| 1 | [Graph Theory Algorithms](https://www.youtube.com/watch?v=DgXR2OWQnLc) | 3:11 | Series trailer |
| 2 | [Graph Theory Introduction](https://www.youtube.com/watch?v=eQA-m22wjTQ) | 14:08 | ⭐ Core |
| 3 | [Overview of Algorithms](https://www.youtube.com/watch?v=87X57ldq1ok) | 9:46 | ⭐ Core |
| 4 | [Depth First Search](https://www.youtube.com/watch?v=7fujbpJ0LB4) | 10:20 | ⭐ Core |
| 5 | [Breadth First Search](https://www.youtube.com/watch?v=oDqjPvD54Ss) | 7:23 | ⭐ Core |
| 6 | [BFS Grid Shortest Path](https://www.youtube.com/watch?v=KiCBXu4P-2Y) | 16:51 | ⭐ Core |
| 7 | [Introduction to Tree Algorithms](https://www.youtube.com/watch?v=1XC3p2zBK34) | 10:22 | Next step |
| 8 | [Beginner Tree Algorithms](https://www.youtube.com/watch?v=0qgaIMqOEVs) | 9:54 | Next step |
| 9 | [Rooting a Tree](https://www.youtube.com/watch?v=2FFq2_je7Lg) | 5:18 | Next step |
| 10 | [Tree Center(s)](https://www.youtube.com/watch?v=nzF_9bjDzdc) | 6:08 | Next step |
| 11–12 | [Isomorphic Trees](https://www.youtube.com/watch?v=OCKvEMF0Xac) / [Code](https://www.youtube.com/watch?v=40Jx-at2P5k) | 11:12 / 10:03 | Advanced |
| 13–14 | [Lowest Common Ancestor](https://www.youtube.com/watch?v=sD1IoalFomA) / [Code](https://www.youtube.com/watch?v=rA7JJG7x9vs) | 17:02 / 6:52 | Advanced |
| 15 | [Topological Sort](https://www.youtube.com/watch?v=eL-KzMXSXXI) | 14:08 | ⭐ Core |
| 16 | [Kahn's Algorithm](https://www.youtube.com/watch?v=cIBFEhD77b4) | 13:32 | ⭐ Core |
| 17 | [Shortest/Longest Path on a DAG](https://www.youtube.com/watch?v=TXkDpqjDMHA) | 9:56 | Next step |
| 18–19 | [Dijkstra](https://www.youtube.com/watch?v=pSqmAO-m7Lk) / [Code](https://www.youtube.com/watch?v=mbLzxKUeLJ4) | 24:46 / 9:17 | ⭐ Core |
| 20 | [Bellman-Ford](https://www.youtube.com/watch?v=lyw4FaxrwHg) | 15:00 | Next step |
| 21–22 | [Floyd-Warshall](https://www.youtube.com/watch?v=4NQ3HnhyNfQ) / [Code](https://www.youtube.com/watch?v=0dTrKG5UK9k) | 15:53 / 9:16 | Next step |
| 23–24 | [Tarjan's SCC](https://www.youtube.com/watch?v=wUgWX0nc4NY) / [Code](https://www.youtube.com/watch?v=hKhLj7bfDKk) | 17:41 / 6:50 | Advanced |
| 25–26 | [Traveling Salesman](https://www.youtube.com/watch?v=cY4HiiFHO1o) / [Code](https://www.youtube.com/watch?v=udEe7Cv3DqU) | 20:27 / 13:20 | Advanced |
| 27 | [Existence of Eulerian Paths](https://www.youtube.com/watch?v=xR4sGgwtR2I) | 9:41 | Advanced |
| 28–29 | [Hierholzer's Algorithm](https://www.youtube.com/watch?v=8MpoO2zA2l4) / [Code](https://www.youtube.com/watch?v=QQ3jO1dKjYQ) | 15:34 / 8:24 | Advanced |
| 30 | [Prim's MST](https://www.youtube.com/watch?v=jsmMtJpPnhU) | 14:52 | Next step |
| 31–32 | [Eager Prim's](https://www.youtube.com/watch?v=xq3ABa-px_g) / [Code](https://www.youtube.com/watch?v=CI5Fvk-dGVs) | 14:33 / 8:17 | Next step |
| 33–34 | [Ford-Fulkerson](https://www.youtube.com/watch?v=LdOnanfc5TM) / [Code](https://www.youtube.com/watch?v=Xu8jjJnwvxE) | 13:25 / 17:29 | Advanced |
| 35 | [Unweighted Bipartite Matching](https://www.youtube.com/watch?v=GhjwOiJ4SqU) | 11:23 | Advanced |
| 36 | [Mice and Owls](https://www.youtube.com/watch?v=ar6x7dHfGHA) | 8:28 | Advanced |
| 37 | [Elementary Math](https://www.youtube.com/watch?v=zrGnYstL4ss) | 10:41 | Advanced |
| 38–39 | [Edmonds-Karp](https://www.youtube.com/watch?v=RppuJYwlcI8) / [Code](https://www.youtube.com/watch?v=OViaWp9Q-Oc) | 9:35 / 5:46 | Advanced |
| 40–41 | [Capacity Scaling](https://www.youtube.com/watch?v=1ewLrXUz4kk) / [Code](https://www.youtube.com/watch?v=hZqiLIaIEFg) | 10:15 / 6:26 | Advanced |
| 42–43 | [Dinic's Algorithm](https://www.youtube.com/watch?v=M6cm8UeeziI) / [Code](https://www.youtube.com/watch?v=_SdF4KK_dyM) | 11:48 / 9:32 | Advanced |
