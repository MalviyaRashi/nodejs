const express = require("express");
const router = express.Router(); //fxn
const bcrypt = require("bcryptjs");
const jsonwb = require("jsonwebtoken");
const passport = require("passport");
const mongoose = require("mongoose");
const key = require("../../setup/myurl");
//@type    get
//@route   /api/auth
//@desc    for testing
//@access  PUBLIC
router.get("/", (req, res) => {
  res.json({ test: "success" });
});
// 

//import schema for registration
const Person = require("../../models/Person");
//@type    get
//@route   /api/auth/register
//@desc    for registration of user
//@access  PUBLIC
router.post("/register", (req, res) => {
  Person.findOne({ email: req.body.email })
    .then(person => {
      if (person) {
        return res.status(400).json({
          emailerror: "email registered already"
        });
      } else {
        const newPerson = new Person({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password
        }); // Store hash in your password DB.
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newPerson.password, salt, (err, hash) => {
            if (err) throw err;
            newPerson.password = hash;
            newPerson
              .save()
              .then(person => res.json(person))
              .catch(err => console.log(err));
          });
        });
      }
    })
    .catch(err => console.log(err));
});
//@type    get
//@route   /api/auth/login
//@desc    login of user
//@access  PUBLIC
router.post("/login", (req, res) => {
  const password = req.body.password;
  const email = req.body.email;
  Person.findOne({ email: email })
    .then(person => {
      if (!person) {
        return res
          .status(404)
          .json({ emailerror: "user not found with this email" });
      }
      bcrypt
        .compare(password, person.password)
        .then(isCorrect => {
          if (isCorrect) {
            // res.json(person);
            //res.json({ success: "user is able to login" });
            //use payload to create token
            const payload = {
              id: person.id,
              name: person.name,
              email: person.email
            };
            jsonwb.sign(
              payload,
              key.secret,
              { expiresIn: 3600 },
              (err, token) => {
                if (err) {
                  return res.status(400).json({ error: " error" });
                } else {
                  res.json({
                    success: true,
                    token: " Bearer " + token
                  });
                }
              }
            );
          } else {
            return res
              .status(400)
              .json({ passworderror: "incorrect password" });
          }
        })
        .catch(err => {
          console.log(err);
        });
    })
    .catch(err => {
      console.log(err);
    });
});
//@type    get
//@route   /api/auth/profile
//@desc    login of user
//@access  PUBLIC

router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    //console.log(req);
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
  }
);
module.exports = router;
