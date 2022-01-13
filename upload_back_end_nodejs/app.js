const express = require('express');
const path = require('path');
const https = require('https')
const fs = require('fs');
const cors = require('cors');
var bodyParser = require('body-parser');
const app = express();

const multer = require('multer');

const uploadA = multer({ dest: 'uploads/' })

const uploadUser = require('./middlewares/uploadImage');
const fileUpload = require('express-fileupload');



// Body Parser middleware
app.use(bodyParser.urlencoded({extended: false}));
// parse application/json
app.use(bodyParser.json());

app.use('/files', express.static(path.resolve(__dirname,"public", "upload")));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    res.header("Access-Control-Allow-Headers", "X-PINGOTHER, Content-Type, x-forwarded-proto, Authorization");
    app.use(cors({ origin: false }));
    next();
});

app.use(fileUpload()); // Don't forget this line!

var busboy = require('connect-busboy');

app.use(busboy()); 

app.use( uploadA.single('avatar'), (req, res, next) => {
    console.log("user :  " + req.user + " ===== files : " + req.files);
    
    
    console.log(req.file)


    console.log(req.files)

    uploadUser.single('image')
    console.log(req.files.image)

    console.log(req.files.image.data)


    next();
})


app.post("/upload-image", uploadA.single('avatar'), async (req, res, next) => {


    if(req.files){

        var file = req.files.image,
        filename = file.name
    
        file.mv(
            `./public/upload/${filename}`, 
            (error) => {
                //callback
                if(error){
                    console.log(error)
                    return res.status(400).json({
                        erro: true,
                        mensagem: "Erro: Upload não realizado com sucesso, necessário enviar uma imagem PNG ou JPG!"
                    });
                }
                else{
                    console.log("not error!")
                    return res.json({
                        erro: false,
                        mensagem: `:3000/files/${filename}`
                    });
    
                }
            }
        )
        
        
    
    }
    
    else if (req.file) {
        
        let fileName = req.file.filename
                
        return res.json({
            erro: false,
            mensagem: `:300/files/${fileName}`
        
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


// http.createServer(app).listen(80);

let server = https.createServer({
    key: fs.readFileSync(path.join(__dirname,  './cert', 'privada25294.key'), 'ascii'),
    cert: fs.readFileSync(path.join(__dirname, './cert', 'certificado25294.pem'), 'ascii')
  }, app)

server.listen(
    3000, () => {
    console.log("Servidor iniciado na porta 3000: localhost:3000");
});

/*
app.listen(8080, () => {
    console.log("Servidor iniciado na porta 8080: http://localhost:8080");
});
*/
