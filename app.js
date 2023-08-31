//Carregando módulos da aplicacao
require('dotenv').config()
const express = require('express')
const { engine } = require('express-handlebars');
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")
const app = express()
const admin_rt = require("./routes/admin")
const path = require("path")
const session = require("express-session")
const flash = require("connect-flash")


// Config 

    // Sessao
    app.use(session({
        secret: "termoweb",
        resave: true,
        saveUninitialized: true
    }))
    app.use(flash())
    
    //Middleware
    app.use( function (req, res, next) {
        res.locals.success_msg = req.flash("success_msg");
        res.locals.error_msg = req.flash("error_msg");
        res.locals.user = req.user || null;
        next();
    })
    
    // Template Engine
    app.engine('handlebars', engine({defaultLayout: 'main'}))
    app.set('view engine', 'handlebars')
    
    // Body Parser
    app.use(express.urlencoded({extended: false}))
    app.use(express.json())

    // JSON  response
    app.use(express.json())

    //Public
    app.use(express.static(path.join(__dirname,"public")))

//================================================================================
//Models

const User = require('./models/User')

//================================================================================
//Rotas

//Rota principal ADMIN
app.use('/admin', admin_rt)

//================================================================================
//Rota Principal da aplicacao

app.get('/', function(req, res) {
    res.render('home')
})

//Rota Sobre

app.get('/sobre', function(req, res) {
    res.render('sobre')
})

//========================================================================================
//Rota de Login
app.get('/login', function(req, res) {
    res.render('login')
})
//========================================================================================
//Rota de Registro
app.get('/registro', function(req, res) {
    res.render('registro')
})
//========================================================================================


// Private Route
app.get('/user/:id', checkToken, async(req, res) => {
    const id = req.params.id

    // check if user exists
    const user = await User.findById(id, '-password')

    if(!user) {
        return res.status(404).json({ msg: 'Usuario não encontrado!'})
    }

    res.status(200).json({ user })
})

function checkToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
        return res.status(401).json({msg: "Acesso negado!"})
    }

    try {

        const secret = process.env.SECRET

        jwt.verify(token, secret)

        next()

    } catch(error) {
        res.status(400).json({msg:"Token inválido!"})
    }

}

//================================================================================
// Register User
app.post('/auth/register', async function(req, res) {
    
    const {nome, email, password, confirmpassword} = req.body

    // Validations
    if (!nome){
        return res.status(422).json({msg: 'O nome é obrigatório!'})
    }
    if (!email){
        return res.status(422).json({msg: 'O email é obrigatório!'})
    }
    if (!password){
        return res.status(422).json({msg: 'A senha é obrigatória!'})
    }
    if (password !== confirmpassword) {
        return res.status(422).json({msg: 'As senhas não coincidem!'})
    }

    // check if user exists
    const userExists = await User.findOne({email: email})

    if (userExists) {
        return res.status(422).json({msg: 'Por favor, utilize outro e-mail!'})
    }

    //create password
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    //create user
    const user = new User({
        nome, 
        email, 
        password: passwordHash
    })

    try {
        await user.save()
        res.status(201).json({msg: 'Usuario criado com sucesso!'})

    } catch(error){
        console.log(error)
        res.status(500).json({msg: 'Ocorreu um erro no servidor!'})
    }


})

//====================================================================================
//Login User
app.post("/auth/login", async (req, res) =>{
    const { email, password } = req.body

    //validations
    if (!email){
        return res.status(422).json({msg: 'O email é obrigatório!'})
    }
    if (!password){
        return res.status(422).json({msg: 'A senha é obrigatória!'})
    }

    // check if user exists
    const user = await User.findOne({email: email})

    if (!user) {
        return res.status(404).json({msg: 'Usuario não encontrado!'})
    }

    //check if password match
    const checkPassword = await bcrypt.compare(password, user.password)

    if (!checkPassword) {
        return res.status(422).json({ msg: 'Senha inválida!'})
    }

    try {

        const secret = process.env.SECRET

        const token = jwt.sign({
            id: user.id
        },secret)

        res.status(200).json({ msg: "Autenticacao realizada com sucesso", token})
        console.log(token)
        
    } catch(error){
        console.log(error)

        res.status(500).json({ msg: "Ocorreu um erro no servidor"})
    }



})

//Credentials

const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASS

mongoose.connect(
    `mongodb+srv://${dbUser}:${dbPassword}@cluster0.08zssab.mongodb.net/termodb?retryWrites=true&w=majority`, 
    )
.then(() => {
    app.listen(3000)
    console.log('Conectou ao banco!')
})
.catch((err) => console.log(err))
