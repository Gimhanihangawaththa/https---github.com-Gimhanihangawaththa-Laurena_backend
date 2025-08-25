const router = require('express').Router();
let user = require('../models/user');   

router.route('/add').post((req, res) => {

    const name = req.body.name;
    const email_address = req.body.email_address;
    const password = req.body.password;

    const newUser = new user({
        name,
         email_address,
          password
    });

    newUser.save()
    .then(() => {res.json('User added!')})
    .catch((err) =>{console.log(err);})
})

router.route("/").get((req, res) => {

    user.find()
    .then((users) => {res.json(users)})
    .catch((err) => {console.log(err);})
})

router.route("/update/:id").put(async(req, res) => {

   let userId = req.params.id;
   const {name, email_address, password} = req.body;

   const updateUser = {
    name,
    email_address,
    password
   }
   const update = await user.findByIdAndUpdate(userId, updateUser).then(() => {
   res.status(200).send({status: "User updated"})
   })
   .catch((err) => {
    console.log(err);
     res.status(500).send({status: "error with updating data", error: err.message});
   })
})

router.route("/delete/:id").delete(async(req, res) => {

    let userId = req.params.id;

    await user.findByIdAndDelete(userId)
    .then(() => {res.status(200).send({status: "User deleted"})})
    .catch((err) => {
        console.log(err);
        res.status(500).send({status: "Error with delete user", error: err.message});
    })
})
router.route("/get/:id").get(async(req, res) => {   
    let userId = req.params.id;
    await user.findById(userId)
    .then((user) => {res.status(200).send({status: "User fetched", user})})
    .catch(() => {
        console.log(err.message);
        res.status(500).send({status: "Error with get user", error: err.message});
    })
})
module.exports = router;