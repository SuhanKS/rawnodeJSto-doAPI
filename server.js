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
  // 3. Handle PUT /todos/:id (UPDATE) (NEW CODE)
  else if (url.startsWith("/todos/") && method === "PUT") {
    // 1. Get the ID from the URL
    const id = parseInt(url.split("/")[2]);

    // 2. Find the task we want to update
    const todoIndex = todos.findIndex((t) => t.id === id);

    // 3. Check if the task exists
    if (todoIndex === -1) {
      // 3a. If not, send 404
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "To-do not found" }));
    } else {
      // 3b. If it exists, parse the request body
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });

      req.on("end", () => {
        try {
          const updateData = JSON.parse(body);

          // 4. Update the task
          // We can update text, completed status, or both
          const originalTodo = todos[todoIndex];
          const updatedTodo = {
            ...originalTodo, // Copy original fields
            text: updateData.text || originalTodo.text, // Use new text or keep old
            completed:
              updateData.completed !== undefined
                ? updateData.completed
                : originalTodo.completed, // Use new status or keep old
          };

          // 5. Replace the old task with the updated one
          todos[todoIndex] = updatedTodo;

          // 6. Send back the updated task
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(updatedTodo));
        } catch (error) {
          // Handle bad JSON
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Invalid JSON format" }));
        }
      });
    }
  }

  //4. Handle DELETE /todos/:id(NEW CODE)
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

  // 5. Handle 404 Not Found
  else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Route Not Found" }));
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
