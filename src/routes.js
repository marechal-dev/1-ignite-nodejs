import { randomUUID } from "node:crypto";

import { Database } from "./database.js";
import { buildRoutePath } from "./utils/build-route-path.js";

const database = new Database();

export const routes = [
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: (request, response) => {
      const { search } = request.query;

      const tasks = database.select("tasks", search ? {
        task: search,
        description: search,
      } : null);

      return response.end(JSON.stringify(tasks));
    }
  },
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: (request, response) => {
      if (!request.body) {
        return response
          .writeHead(400)
          .end(JSON.stringify({
            status: "Bad Request",
            error: "No data"
          }));
      }

      const { title, description } = request.body;

      if (title && description) {
        const task = {
          id: randomUUID(),
          title,
          description,
          completed_at: null,
          created_at: new Date(),
          updated_at: new Date(),
        };

        database.insert("tasks", task);

        return response.writeHead(201).end();
      }

      return response.writeHead(400).end(JSON.stringify({
        status: "Bad Request",
        error: "Title or Description invalid or missing"
      }));
    }
  },
  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handler: (request, response) => {
      const { id } = request.params;

      const taskExists = database.select("tasks", {
        id
      });

      if (taskExists) {
        const { title, description } = request.body;

        database.update("tasks", id, { title, description });

        return response.writeHead(204).end();
      }

      return response.writeHead(404).end(JSON.stringify({
        status: "Not Found",
        error: `Task with ID ${id} not found`
      }));
    }
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: (request, response) => {
      const { id } = request.params;

      const taskExists = database.select("tasks", {
        id
      });

      if (taskExists) {
        database.delete("users", id);

        return response.writeHead(204).end();
      }

      return response.writeHead(404).end(JSON.stringify({
        status: "Not Found",
        error: `Task with ID ${id} not found`
      }));
    }
  },
  {
    method: "PATCH",
    path: buildRoutePath("/tasks/:id/complete"),
    handler: (request, response) => {
      const { id } = request.params;

      const task = database.select("tasks", {
        id
      });

      if (task) {
        database.update("users", id, {
          ...task,
          completed_at: task.completed_at ? null : new Date(),
        });

        return response.writeHead(204).end();
      }

      return response.writeHead(404).end(JSON.stringify({
        status: "Not Found",
        error: `Task with ID ${id} not found`
      }));
    }
  },
];