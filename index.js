const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

// --- Cached DB connection for serverless (avoids reconnecting on every request) ---
let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    isConnected = true;
    console.log("Connected");
  } catch (err) {
    console.log("DB FAILED", err);
  }
}

app.use(async (req, res, next) => {
  await connectDB();
  next();
});

const model = mongoose.model(
  "db1",
  {
    name: String,
    age: Number,
    course: String,
    status: String,
  },
  "students",
);

app.get("/students", (req, res) => {
  model
    .find()
    .sort({ _id: -1 })
    .then((data) => {
      res.send(
        data.map((ele) => {
          return ele;
        }),
      );
    });
});

app.get("/search/:name", (req, res) => {
  console.log(req.params.name);
  model
    .find({
      name: { $regex: req.params.name, $options: "i" },
    })
    .then((data) => {
      res.send(data);
    })
    .catch(() => {
      res.send({ Error: "Search Failed" });
    });
});

app.post("/addstu", (req, res) => {
  model
    .create(req.body)
    .then(() => {
      res.send({ Success: "Student Added" });
    })
    .catch(() => {
      res.send({ Oops: "Data Not Added" });
    });
});

app.delete("/delete/:id", (req, res) => {
  model
    .findByIdAndDelete(req.params.id)
    .then(() => {
      res.send({ Success: "Deleted" });
    })
    .catch(() => {
      res.send({ Error: "Operation Not Completed" });
    });
});

app.put("/update/:id", (req, res) => {
  model
    .findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        course: req.body.course,
        status: req.body.status,
      },
      { returnDocument: "after" },
    )
    .then((data) => {
      res.send(data);
    })
    .catch(() => {
      res.send({ Oops: "Not Saved" });
    });
});

// Only listen on a port locally — Vercel runs this as a serverless function
if (process.env.NODE_ENV !== "production") {
  app.listen(3000, () => {
    console.log("Server Started");
  });
}

module.exports = app;