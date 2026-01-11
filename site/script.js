function parseEdges() {
  const lines = document.getElementById('edgesInput').value.trim().split('\n');
  let edges = [];

  for (let line of lines) {
    if (line.trim() === '') continue;
    let [u, v, w] = line.trim().split(' ').map(Number);
    edges.push([u, v, w]);
  }
  return edges;
}

function showGraphInfo() {
  const edges = parseEdges();
  let info = 'Структура графа:\n\n';
  let nodes = new Set();
  let totalCapacity = 0;

  edges.forEach(([u, v, w]) => {
    nodes.add(u);
    nodes.add(v);
    totalCapacity += w;
    info += `Дуга ${u} → ${v} (потік: ${w})\n`;
  });

  info += `\nЗагальна інформація:\n`;
  info += `• Кількість вершин: ${nodes.size}\n`;
  info += `• Кількість дуг: ${edges.length}\n`;
  info += `• Сумарна пропускна здатність: ${totalCapacity}\n`;
  info += `• Джерело: ${document.getElementById('sourceNode').value}\n`;
  info += `• Сток: ${document.getElementById('sinkNode').value}`;

  document.getElementById('graphInfo').textContent = info;
}

/* -------------------- МІНТІ / БЕЛЛМАН-ФОРД -------------------- */
function runMinty() {
  const n = Number(document.getElementById('nodeCount').value);
  const edges = parseEdges();
  const source = Number(document.getElementById('sourceNode').value);

  let dist = Array(n + 1).fill(Infinity);
  dist[source] = 0;

  for (let i = 1; i < n; i++) {
    for (let [u, v, w] of edges) {
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
      }
    }
  }

  // Перевірка на наявність негативних циклів
  let hasNegativeCycle = false;
  for (let [u, v, w] of edges) {
    if (dist[u] + w < dist[v]) {
      hasNegativeCycle = true;
      break;
    }
  }

  let result = `Найкоротші відстані від вершини ${source}:\n\n`;
  for (let i = 1; i <= n; i++) {
    if (dist[i] === Infinity) {
      result += `Вершина ${i}: недосяжна\n`;
    } else {
      result += `Вершина ${i}: ${dist[i]}\n`;
    }
  }

  if (hasNegativeCycle) {
    result += '\n⚠️ Увага: граф містить негативний цикл!';
  }

  document.getElementById('mintyResult').textContent = result;
}

/* -------------------- ФОРД-ФАЛКЕРСОН -------------------- */

function bfs(res, s, t, parent) {
  let visited = new Set();
  let queue = [s];
  visited.add(s);

  while (queue.length > 0) {
    let u = queue.shift();
    for (let v in res[u]) {
      v = Number(v);
      if (!visited.has(v) && res[u][v] > 0) {
        visited.add(v);
        parent[v] = u;
        if (v === t) return true;
        queue.push(v);
      }
    }
  }
  return false;
}

function runFordFulkerson() {
  const n = Number(document.getElementById('nodeCount').value);
  const edges = parseEdges();
  const s = Number(document.getElementById('sourceNode').value);
  const t = Number(document.getElementById('sinkNode').value);

  if (s === t) {
    document.getElementById('flowResult').textContent =
      'Помилка: джерело і стік співпадають!';
    return;
  }

  // Ініціалізація залишкової мережі
  let res = {};
  for (let i = 1; i <= n; i++) res[i] = {};

  // Заповнення мережі
  for (let [u, v, w] of edges) {
    res[u][v] = w;
    if (res[v][u] === undefined) res[v][u] = 0;
  }

  let parent = {};
  let maxFlow = 0;
  let iterations = 0;
  const maxIterations = 1000;

  while (bfs(res, s, t, parent) && iterations < maxIterations) {
    let flow = Infinity;
    let v = t;

    // Знаходимо мінімальний потік у шляху
    while (v !== s) {
      let u = parent[v];
      flow = Math.min(flow, res[u][v]);
      v = u;
    }

    // Оновлюємо залишкові пропускні здатності
    v = t;
    while (v !== s) {
      let u = parent[v];
      res[u][v] -= flow;
      res[v][u] += flow;
      v = u;
    }

    maxFlow += flow;
    parent = {};
    iterations++;
  }

  if (iterations >= maxIterations) {
    document.getElementById('flowResult').textContent =
      'Досягнуто максимальну кількість ітерацій. Можливий нескінченний цикл.';
  } else {
    document.getElementById(
      'flowResult'
    ).textContent = `Максимальний потік від ${s} до ${t}: ${maxFlow}`;
  }
}

/* -------------------- REWARD SYSTEM -------------------- */

let points = 0;
function reward() {
  points += 10;
  document.getElementById('rewardPoints').textContent = 'Ваші бали: ' + points;

  // Додатковий функціонал при накопиченні балів
  if (points >= 50) {
    document.getElementById('rewardPoints').innerHTML +=
      '<br>🎉 Вітаємо! Ви отримали бонус - всі алгоритми тепер працюють швидше!';
  }
}

// Ініціалізація при завантаженні сторінки
document.addEventListener('DOMContentLoaded', function () {
  showGraphInfo();
});
