const express = require("express");
const { randomBytes } = require("crypto");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const commentsByPostId = {};

app.get("/posts/:id/comments", (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
});

app.post("/posts/:id/comments", async (req, res) => {
  const commentId = randomBytes(4).toString("hex");
  const { content } = req.body;
  const comments = commentsByPostId[req.params.id] || [];
  const newComment = { id: commentId, content, status: "PENDING" };
  comments.push(newComment);
  commentsByPostId[req.params.id] = comments;
  await axios.post("http://eventbus:4005/events", {
    type: "CommentCreated",
    data: {
      postId: req.params.id,
      ...newComment,
    },
  });
  res.status(201).send(comments);
});

app.post("/events", async (req, res) => {
  const { type, data } = req.body;
  if (type === "CommentModerated") {
    console.log("Processing Comment Moderated, Data - ", data);
    const { postId, id, status } = data;
    const comments = commentsByPostId[postId];
    const commentToUpdate = comments.find((comment) => comment.id === id);
    console.log("Comment To Update", commentToUpdate);
    commentToUpdate.status = status;
    await axios.post("http://eventbus:4005/events", {
      type: "CommentUpdated",
      data: {
        postId,
        ...commentToUpdate,
      },
    });
  }
  res.send({});
});

app.listen(4001, () => {
  console.log("Listening on 4001");
});
