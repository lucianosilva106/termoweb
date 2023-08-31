const express = require('express')
const router = express.Router()

router.get("/registro", (req, res) => {
    res.render("registro")
})


module.exports = router