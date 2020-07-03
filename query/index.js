const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const posts = {};

const handleEvent = (type, data) => {
  if (type === "PostCreated") {
    console.log("Processing Post Created - Data", data);
    const { id, title } = data;
    posts[id] = { id, title, comments: [] };
  }
  if (type === "CommentCreated") {
    console.log("Processing CommentCreated - Data ", data);
    const { postId, id, content, status } = data;
    const comments = posts[postId].comments;
    comments.push({
      id,
      content,
      status,
    });
  }
  if (type === "CommentUpdated") {
    console.log("Processing CommentUpdated - Data", data);
    const { postId, id, status, content } = data;
    const comment = posts[postId].comments.find((comment) => comment.id === id);
    console.log("Old Comment: ", comment);
    comment.status = status;
    comment.content = content;
    console.log("New Comment: ", comment);
  }
};

app.get("/posts", (req, res) => {
  res.send(posts);
});

app.post("/events", (req, res) => {
  const { type, data } = req.body;
  handleEvent(type, data);
  res.send({});
});

app.listen(4002, async () => {
  console.log("Listening on 4002");
  const res = await axios.get("http://localhost:4005/events");
  for (let event of res.data) {
    console.log("Processing Event: ", event.type);
    handleEvent(event.type, event.data);
  }
});
