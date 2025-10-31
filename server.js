const http = require("http");

let todos = [
  { id: 1, text: "Learn raw Node.js", completed: false },
  { id: 2, text: "Build a server", completed: false },
];

const PORT = 3000;

const server = http.createServer((req, res) => {
  const { url, method } = req;
  console.log(`Incoming request: ${method} ${url}`);

  // 1. Handle GET /todos (READ)
  if (url === "/todos" && method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(todos));
  } // 2. Handle POST /todos (CREATE)
  else if (url === "/todos" && method === "POST") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const newTodoData = JSON.parse(body);

        if (!newTodoData.text) {
          // Add some simple validation
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Task text is required" }));
          return; // Stop execution
        }

        const newTodo = {
          id: todos.length + 1,
          text: newTodoData.text,
          completed: false,
        };

        todos.push(newTodo);
        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify(newTodo));
      } catch (error) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Invalid JSON format" }));
      }
    });
  }

  //3. Handle DELETE /todos/:id(NEW CODE)
  else if (url.startsWith("/todos/") && method === "DELETE") {
    // 1. get the id from the url
    const id = parseInt(url.split("/")[2]);

    // 2. check if the task exists
    const todoExists = todos.find((t) => t.id === id);

    if (!todoExists) {
      // if not found
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "To-do not found" }));
    } else {
      // if found, remove it
      todos = todos.filter((t) => t.id !== id);
      // send success response
      res.writeHead(204); // 204 means "No Content"
      res.end();
    }
  }

  // 4. Handle 404 Not Found
  else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Route Not Found" }));
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
