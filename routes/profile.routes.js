const express = require('express');
const router = express.Router();
const User = require("../models/User.model")

const { isLoggedIn, isAdmin } = require("../middlewares/auth.middlewares.js")

// aqui van nuestras rutas de prefil (verlo, actualizarlo, ver usuarios, etc)
// GET "/profile" => el usuario puede ver su perfil
router.get("/", isLoggedIn, (req, res, next) => {

  // if (req.session.activeUser === undefined) {
  //   res.redirect("/auth/login")
  //   return;
  // }

  // EN TODAS LAS RUTAS DE MI SERVIDOR YO VOY A TENER ACCESO A REQ.SESSION.ACTIVEUSER
  console.log("Usuario que hace la solicitud", req.session.activeUser)

  User.findById(req.session.activeUser._id)
  .then((response) => {

    res.render("profile/my-profile.hbs", {
      userDetails: response
    })
  })
  .catch((err) => {
    next(err)
  })

})

// GET "/profile/admin-dashboard" => ruta para que el admin tenga acceso a editar cualquier perfil
router.get("/admin-dashboard", isLoggedIn, isAdmin, (req, res, next) => {

  res.render("profile/admin-dashboard.hbs")

})

module.exports = router;