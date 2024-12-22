const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const messagesFilePath = path.join(__dirname, "messages.txt");

// Check if messages.txt exists; if not, create it
if (!fs.existsSync(messagesFilePath)) {
  fs.writeFileSync(messagesFilePath, "", "utf8");
}

app.use(express.urlencoded({ extended: true }));

app.get("/login", (req, res) => {
  res.send(`
      <form action="/login" method="POST" onsubmit="saveUsername(event)">
        <input type="text" name="username" placeholder="Username" required />
        <button type="submit">Login</button>
      </form>
      <script>
        function saveUsername(event) {
          event.preventDefault();
          const username = event.target.username.value;
          localStorage.setItem('username', username);
          window.location.href = "/";
        }
      </script>
    `);
});

app.get("/", (req, res) => {
  fs.readFile(messagesFilePath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).send("Internal Server Error");
    }

    const messages = data.split("\n").filter(Boolean);
    const username = `<script>document.write(localStorage.getItem('username'));</script>`;

    res.send(`
        <ul>
          ${messages.map((message) => `<li>${message}</li>`).join("")}
        </ul>
        <form action="/" method="POST">
          <input type="text" name="message" placeholder="Enter your message" required />
          <input type="hidden" name="username" id="username" value="${username}" />
          <button type="submit">Add Message</button>
        </form>
        <script>
          document.getElementById('username').value = localStorage.getItem('username');
        </script>
      `);
  });
});

app.post("/", (req, res) => {
  const { message, username } = req.body;
  const newMessage = `${username}: ${message}`;

  fs.appendFile(messagesFilePath, newMessage + "\n", (err) => {
    if (err) {
      return res.status(500).send("Internal Server Error");
    }
    res.redirect("/");
  });
});

app.listen(8080, () => {
  console.log("Server running on port 8080");
});
