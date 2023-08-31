const mongoose = require('mongoose')

const Produto = mongoose.model('Produto', {
    codigo: String,
    descricao: String,
    precopadrao: Number,
})

module.exports = Produto