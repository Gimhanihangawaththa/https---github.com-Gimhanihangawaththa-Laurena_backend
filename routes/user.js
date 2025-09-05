// const router = require('express').Router();
// let user = require('../models/user');   

// router.route('/add').post((req, res) => {

//     const name = req.body.name;
//     const email_address = req.body.email_address;
//     const password = req.body.password;

//     const newUser = new user({
//         name,
//          email_address,
//           password
//     });

//     newUser.save()
//     .then(() => {res.json('User added!')})
//     .catch((err) =>{console.log(err);})
// })

// router.route("/").get((req, res) => {

//     user.find()
//     .then((users) => {res.json(users)})
//     .catch((err) => {console.log(err);})
// })

// router.route("/update/:id").put(async(req, res) => {

//    let userId = req.params.id;
//    const {name, email_address, password} = req.body;

//    const updateUser = {
//     name,
//     email_address,
//     password
//    }
//    const update = await user.findByIdAndUpdate(userId, updateUser).then(() => {
//    res.status(200).send({status: "User updated"})
//    })
//    .catch((err) => {
//     console.log(err);
//      res.status(500).send({status: "error with updating data", error: err.message});
//    })
// })

// router.route("/delete/:id").delete(async(req, res) => {

//     let userId = req.params.id;

//     await user.findByIdAndDelete(userId)
//     .then(() => {res.status(200).send({status: "User deleted"})})
//     .catch((err) => {
//         console.log(err);
//         res.status(500).send({status: "Error with delete user", error: err.message});
//     })
// })
// router.route("/get/:id").get(async(req, res) => {   
//     let userId = req.params.id;
//     await user.findById(userId)
//     .then((user) => {res.status(200).send({status: "User fetched", user})})
//     .catch(() => {
//         console.log(err.message);
//         res.status(500).send({status: "Error with get user", error: err.message});
//     })
// })
// module.exports = router;

const router = require('express').Router();
const bcrypt = require('bcryptjs'); // for hiding (hashing) passwords
let User = require('../models/user');

// 🟢 Signup Route
router.post('/add', async (req, res) => {
  const { name, email_address, password } = req.body;

  try {
    // check if this email is already used
    const existingUser = await User.findOne({ email_address });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 🟢 hide (hash) the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // save user with hidden password
    const newUser = new User({
      name,
      email_address,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: "User added successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🟢 Login Route
router.post("/login", async (req, res) => {
  const { email_address, password } = req.body;

  try {
    // check if email exists
    const existingUser = await User.findOne({ email_address });
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // compare passwords
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Wrong password" });
    }

    // success 🎉
    res.status(200).json({
      message: "Login successful",
      user: {
        id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email_address,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🟢 Get All Users
router.get("/", (req, res) => {
  User.find()
    .then((users) => res.json(users))
    .catch((err) => console.log(err));
});

// 🟢 Update User
router.put("/update/:id", async (req, res) => {
  let userId = req.params.id;
  const { name, email_address, password } = req.body;

  try {
    const updateUser = {
      name,
      email_address,
    };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateUser.password = await bcrypt.hash(password, salt);
    }

    await User.findByIdAndUpdate(userId, updateUser);
    res.status(200).send({ status: "User updated" });
  } catch (err) {
    console.log(err);
    res.status(500).send({ status: "Error updating user", error: err.message });
  }
});

// 🟢 Delete User
router.delete("/delete/:id", async (req, res) => {
  let userId = req.params.id;

  try {
    await User.findByIdAndDelete(userId);
    res.status(200).send({ status: "User deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).send({ status: "Error deleting user", error: err.message });
  }
});

// 🟢 Get Single User
router.get("/get/:id", async (req, res) => {
  let userId = req.params.id;

  try {
    const user = await User.findById(userId);
    res.status(200).send({ status: "User fetched", user });
  } catch (err) {
    console.log(err);
    res.status(500).send({ status: "Error fetching user", error: err.message });
  }
});

module.exports = router;
