const express = require('express');
const router = express.Router();
const User = require('../models/User.model');
const bcrypt = require("bcryptjs")

// aqui van las rutas de autenticación (signup y login)

// GET "/auth/signup" => renderizar la vista de formulario registro
router.get("/signup", (req, res, next) => {
  res.render("auth/signup.hbs")
})

// POST "/auth/signup" => recibir la info del formulario y crear el perfil en la BD
router.post("/signup", async (req, res, next) => {
  // aqui recibiremos la info del formulario

  const { username, email, password } = req.body
  console.log(req.body)

  // 1. Validaciones de backend
  // .todos los campos deben estar llenos
  if (username === "" || email === "" || password === "") {
    res.render("auth/signup.hbs", {
      errorMessage: "Debes llenar todos los campos"
    })
    return; // deten la ejecucion de la ruta. 
  }

  // EJEMPLO validar el el username tenga minimo 3 caracteres
  
  // validar la fuerza de la contraseña
  // const passwordRegex = new RegExp("/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm")
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm
  if (passwordRegex.test(password) === false) {
    res.render("auth/signup.hbs", {
      errorMessage: "La contraseña debe tener minimo 8 caracteres, una mayuscula y un numero"
    })
    return; // deten la ejecucion de la ruta. 
  }


  // EJEMPLO validar el formato de correo electronico

  
  try {
    // validacion de que el usuario sea unico, no esté actualmente registrado en la DB
    const foundUser = await User.findOne({username: username})
    console.log(foundUser)
    if (foundUser !== null) {
      // si existe en la BD
      res.render("auth/signup.hbs", {
        errorMessage: "Usuario ya creado con ese nombre"
      })
      return; // deten la ejecucion de la ruta. 
    }

    // EJEMPLO verificar tambien que el correo electronico sea unico, no este actualmente registrado en la DB
    
    // 2. Elemento de seguridad
    const salt = await bcrypt.genSalt(12)
    const hashPassword = await bcrypt.hash(password, salt)

    // 3. Crear el perfil del usuario
    const newUser = {
      username: username,
      email: email,
      password: hashPassword
    }

    await User.create(newUser)

    res.redirect("/auth/login")

  } catch (error) {
    next(error)
  }

})

// GET "/auth/login" => renderizar la vista del formulario de acceso a la pagina
router.get("/login", (req, res, next) => {
  res.render("auth/login.hbs")
})

// POST "/auth/login" => recibe las credenciales del usuario y lo valida
router.post("/login", async (req, res, next) => {

  const { email, password } = req.body
  console.log(req.body)

  // 1. validaciónes de backend
  if (email === "" || password === "") {
    res.render("auth/login.hbs", {
      errorMessage: "Los campos deben estar completos"
    })
    return;
  }

  // EJEMPLO dos campos de contraseña. Verificar que sean igual. if (password1 !== password2)

  try {
    // verificar que el usuario exista
    const foundUser = await User.findOne({email: email})
    if (foundUser === null) {
      // si no existe
      res.render("auth/login.hbs", {
        errorMessage: "Credenciales incorrectas"
      })
      return;
    }
    
    // 2. verificar la contraseña del usuario (validar)
    const isPasswordValid = await bcrypt.compare(password, foundUser.password)
    console.log("isPasswordValid", isPasswordValid)
    if (isPasswordValid === false) {
      res.render("auth/login.hbs", {
        // errorMessage: "Credenciales incorrectas (contraseña)"
        errorMessage: "Credenciales incorrectas"
      })
      return;
    }

    // a partir de este punto el usuario estaría validado
    // 3. Implementar un sistema de sesions y abrir una sesion para este usuario

    // que el usuario solo puede entrar a profile si ha iniciado sesion
    // nos da el id del usuario activo para funcionalidades
    // nos ayuda a tener enlaces especificos si el usuario esta logeado o no

    // 4. redireccionar a una pagina privada
    res.redirect("/profile")

  } catch (error) {
    next(error)
  }



})


module.exports = router;