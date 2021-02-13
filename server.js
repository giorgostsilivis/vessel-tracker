const ws = require('ws');
const sqlite3 = require('sqlite3').verbose();

const http = require('http');
const url = require('url');
const fs = require('fs');

const server = http.createServer((req,res) => {
  let parsedURL = url.parse(req.url,true);
  let path = parsedURL.path.replace(/^\/+|\/+$/g,"");
  if (path ==""){
    path = "index1.html";
  }
  console.log(`requested path ${path}`)

  let file = __dirname + "/public/" +path;
  fs.readFile(file,function(err,content){
    if(err){
      console.log(`file not found ${file}`);
      res.writeHead(404);
      res.end;
    } else{
      console.log(`returning ${path}`);
      res.setHeader("X-Content-Type-Options","nosniff");
      switch(path){
        case "index1.html":
           res.writeHead(200,{"Content-type": "text/html"});
           break;
        // case "style.css":
        //    res.writeHead(200,{"Content-type": "text/css"});
        // case "ship.webp":
        //    res.writeHead(200,{"Content-type": "image"});
      }
      res.end(content);
    }
  });
});

server.listen(8005, "127.0.0.1",()=> {
  console.log('listening on port 8005');
})

let db = new sqlite3.Database('thebase.db', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the in-memory SQlite database.');
});

let rowarray = [];
for (i = 1; i < 371585; i++) {
  let sql = `SELECT * FROM day WHERE rowid = ${i}`;
  db.all(sql, [], (err, rows) => {
    //console.log(rows)
    if (err) {
      throw err;
    }
    rows.forEach((row) => {
      //console.log(row);
      rowarray.push(row);
      //console.log(rowarray);
    });
  });

}

db.close((err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Closed the database connection.');
});


const wss = new ws.Server({port:8086});


wss.on('connection', ws =>{
  console.log('A client just connected');
  // ws.on('close',() => {console.log('Client disconnected')});
  // ws.on('close',() => {wss.close()});
  ws.onclose = function(){
                socketstate = 0
                ws.terminate()
            };


  ws.on('message',message => {
    try {
      const data = JSON.parse(message)
      console.log(data);
    }catch(e) {
      console.log(`something went wrong with the message: ${e.message}`);
    }

  })
  // wss.broadcast('something else');

    async function demo() {
      let counter = 0
      // sleep(5000)
      for (let i = 0; i < 371585; i++) {
          ws.send(JSON.stringify(rowarray[i]));
          // console.log(counter);
          counter++;
          if(counter % 60 === 0){
            await sleep(3000);
          }
      }
    }
  demo();


})

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

wss.broadcast = function broadcast(msg) {
   //console.log(msg);
   wss.clients.forEach(function each(client) {
       client.send(msg);
    });
};
