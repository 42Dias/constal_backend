const express = require('express');
var cors = require('cors');
const path = require('path');

const app = express();
const uploadUser = require('./middlewares/uploadImage');


app.use('/files', express.static(path.resolve(__dirname,"public", "upload")));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    res.header("Access-Control-Allow-Headers", "X-PINGOTHER, Content-Type, Authorization");
    app.use(cors());
    next();
});


app.post("/upload-image", uploadUser.single('image'), async (req, res) => {

    if (req.file) {
        let fileName = req.file.filename
        
        return res.json({
            erro: false,
            mensagem: `:8080/files/users/${fileName}`
        
        });
        return res.status(400).json({
            erro: true,
            mensagem: "Erro: Upload não realizado com sucesso!"
        });
        
    }else{
        return res.status(400).json({
            erro: true,
            mensagem: "Erro: Upload não realizado com sucesso, necessário enviar uma imagem PNG ou JPG!"
        });
    }

});

app.listen(8080, () => {
    console.log("Servidor iniciado na porta 8080: http://localhost:8080");
});

