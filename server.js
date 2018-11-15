var http = require('http');
const express = require('express')
const app = express()
const port = 2000

app.get('/', (req, res) => res.send('Hello World!'))

app.get('/test/:filename', (req, res) => res.sendFile(__dirname+"/test_resources/"+req.params.filename));

app.get('/index.html', (req, res) => res.sendFile(__dirname+"/index.html"));
app.get('/cubetexture.png', (req, res) => res.sendFile(__dirname+"/cubetexture.png"));
app.get('/:filename', (req, res) => res.sendFile(__dirname+"/build/"+req.params.filename));

app.get('/src/:folder/:filename', (req, res) => res.sendFile(__dirname+"/src/"+req.params.folder+"/"+req.params.filename));

app.listen(port, () => console.log(`Example app listening on port ${port}!`))