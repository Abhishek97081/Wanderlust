const express=require("express");
const router=express.Router();


router.get("/users", (req, res) => {        
    res.send("get for users");
});
router.get("/users/:id", (req, res) => {   
    res.send("get for user with ID: ");
});
router.post("/users", (req, res) => {
    res.send("post for users");
});
router.delete("/users/:id", (req, res) => {
    res.send("delete for user with ID: ");
});

module.exports=router;
