const mongoose = require('mongoose')

const Cadastro = mongoose.model('Cadastro', {
    nome: String,
    celular: String,
})

module.exports = Cadastro