const express = require("express")
const router = express.Router()
const mongoose = require('mongoose')
const Cadastro = require('../models/Cadastro')
const Produto = require('../models/Produto')
const {eAdmin} = require("../helpers/eAdmin")


// Rota raiz administrativa ==================================================

router.get('/', function(req, res){
    res.render('admin/index')
})

//=============================================================================
// Rotas Cadastros

// Tabela de Cadastros

router.get('/cadastros', function(req, res){
    Cadastro.find().lean().then((cadastros) => {
        res.render('admin/cadastros', {cadastros: cadastros})
    }).catch((err) =>{
        req.flash("error_msg", "Houve um erro ao lista os cadastros!")
    })
    
})

// Formulario de adicao/editcao e exclusao de cadastro

// Adicao

router.get('/cadastros/add', function(req, res){
    res.render('admin/addcadastro')
})

router.post('/cadastros/nova', async function(req, res) {

    const {nome, celular} = req.body

    // Validations
    if (!nome || typeof nome == undefined || nome == null){
        return res.status(422).json({msg: 'O nome é obrigatório!'})
    }

    if (!celular){
        return res.status(422).json({msg: 'O celular é obrigatório!'})
    }

    const cadastroExists = await Cadastro.findOne({celular: celular})

    if (cadastroExists) {
        return res.status(422).json({msg: 'Este celular de cliente já está cadastrado!'})
    }

    //create cadastro
    const cadastro = new Cadastro({
        nome, 
        celular 
    })

    try {
        await cadastro.save()
//        res.status(201).json({msg: 'Cadastro criado com sucesso!'})
        res.redirect('/admin/cadastros')
    } catch(error){
        console.log(error)
        res.status(500).json({msg: 'Ocorreu um erro no servidor!'})
    }
})

// Edicao

router.get('/cadastros/edit/:id', function(req, res){

    Cadastro.findOne({_id:req.params.id}).lean().then((cadastro) => {
        res.render('admin/editcadastro', {cadastro: cadastro})
    }).catch((err)=> {
        res.status(500).json({msg: 'Ocorreu um erro ao ler cadastro!'})
    })
    
})

router.post('/cadastros/edit', async function(req, res) {

    await Cadastro.findOne({_id: req.body.id}).then((cadastro) => {
        cadastro.nome = req.body.nome
        cadastro.celular = req.body.celular
        cadastro.save().then(() => {
//            res.status(201).json({msg: 'Cadastro atualizado com sucesso!'})
            res.redirect('/admin/cadastros')
        }).catch((err) => {
            res.status(500).json({msg: 'Houve um erro ao atualizar o cadastro!'})
        })
            
    }).catch((err) => {
        res.status(500).json({msg: 'Ocorreu um erro ao editar cadastro!'})
    })

})

//=============================================================================
// Rotas Produtos

// Tabela de Produtos

router.get('/produtos', function(req, res){
    Produto.find().lean().then((produtos) => {
        res.render('admin/produtos', {produtos: produtos})
    }).catch((err) =>{
        req.flash("error_msg", "Houve um erro ao lista os produtos!")
    })
    
})

// Formulario de adicao/edicao e exclusao de produto

// Adicao

router.get('/produtos/add', function(req, res){
    res.render('admin/addproduto')
})

router.post('/produtos/nova', async function(req, res) {

    const {codigo, descricao, precopadrao} = req.body

    // Validations
    if (!codigo || typeof codigo == undefined || codigo == null){
        return res.status(422).json({msg: 'O código é obrigatório!'})
    }

    if (!descricao){
        return res.status(422).json({msg: 'A descricao é obrigatória!'})
    }

    const produtoExists = await Produto.findOne({codigo: codigo})

    if (produtoExists) {
        return res.status(422).json({msg: 'Este codigo de produto já está cadastrado!'})
    }

    //create produto
    const produto = new Produto({
        codigo, 
        descricao,
        precopadrao
    })

    try {
        await produto.save()
        res.redirect('/admin/produtos')
    } catch(error){
        console.log(error)
        res.status(500).json({msg: 'Ocorreu um erro no servidor!'})
    }
})

// Edicao

router.get('/produtos/edit/:id', function(req, res){

    Produto.findOne({_id:req.params.id}).lean().then((produto) => {
        res.render('admin/editproduto', {produto: produto})
    }).catch((err)=> {
        res.status(500).json({msg: 'Ocorreu um erro ao ler produto!'})
    })
    
})

router.post('/produtos/edit', async function(req, res) {

    await Produto.findOne({_id: req.body.id}).then((produto) => {
        produto.codigo = req.body.codigo
        produto.descricao = req.body.descricao
        produto.precopadrao = req.body.precopadrao
        produto.save().then(() => {
//            res.status(201).json({msg: 'Cadastro atualizado com sucesso!'})
            res.redirect('/admin/produtos')
        }).catch((err) => {
            res.status(500).json({msg: 'Houve um erro ao atualizar o produto!'})
        })
            
    }).catch((err) => {
        res.status(500).json({msg: 'Ocorreu um erro ao editar produto!'})
    })

})


module.exports = router