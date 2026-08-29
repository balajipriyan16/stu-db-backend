const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("Connected");
  })
  .catch(() => {
    console.log("DB FAILED");
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

app.listen(3000, () => {
  console.log("Server Started");
});
