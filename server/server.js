const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const { config } = require("./db");
const db = require('knex')(config);
const app = express();
const path = require('path');
const mime = require('mime');
const fs = require('fs');

const homePage = "http://localhost:3000/";

app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload());

app.get('/', (req,res) => {
    db('images').select('*')
        .then(data => res.json(data))
        .catch(err => console.log(err))
})

app.post('/upload', function(req, res) {
    if (!req.files)
      return res.status(400).send('No files were uploaded.');
    let image = req.files.image;
    image.mv('../public/images/' + image.name, err => {
        if(err){return res.status(500).send(err);}
        db('images').insert({
            filename: image.name,
            name: req.body.name || "",
            type: "active"
        }).then(() => res.redirect(homePage));
    });
  });
app.post('/switchtype', (req, res) => {
    db('images')
    .where('id', req.body.id)
    .update({type: req.body.type === "delete" ? "deleted" : "active"})
    .then(() => res.status(200).send("Update successful"))
    .catch(err => console.log(err))
})
app.get('/download/:filename', function(req, res){

    var file = '../public/images/' + req.params.filename;
    
    var filename = path.basename(file);
    var mimetype = mime.lookup(file);
    
    res.setHeader('Content-disposition', 'attachment; filename=' + filename);
    res.setHeader('Content-type', mimetype);
    
    var filestream = fs.createReadStream(file);
    filestream.pipe(res);
    
});
app.listen(3001, () => {
    console.log('running 3001')
})