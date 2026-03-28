const express = require("express");
const app = express();
const user=require("./routes/user.js");
app.get("/", (req, res) => {        
    res.send("Hello World!");
});
app.use("/users",user);
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});