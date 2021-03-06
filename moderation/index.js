const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

app.post("/events", async (req, res) => {
  const { type, data } = req.body;
  console.log("Recieved event ", type);
  if (type === "CommentCreated") {
    console.log("Processing Comment Created - Data: ", data);
    const status = data.content.toLowerCase().includes("orange")
      ? "REJECTED"
      : "APPROVED";
    await axios.post("http://eventbus-srv:4005/events", {
      type: "CommentModerated",
      data: {
        id: data.id,
        postId: data.postId,
        status,
        content: data.content,
      },
    });
  }
  res.send({});
});

app.listen(4003, () => {
  console.log("Listening on 4003");
});
