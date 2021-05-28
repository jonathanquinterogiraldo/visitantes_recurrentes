const express = require('express');
const app = express(); 
const port = 3000;  

const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/newdatabase', { 
    useNewUrlParser: true ,
    useUnifiedTopology: true
});

mongoose.connection.on("error", (error) => console.log(error));
mongoose.connection.once("open", () => console.log("Mongoose conectado"));

const visitSchema = mongoose.Schema({      
    name: String,  
    count: Number      
});

const Visitor = mongoose.model("Visitor", visitSchema);

app.get('/', async (req, res) => {

    let name = 'Anónimo';

    if (req.query.name) {
        name = req.query.name;
    }    

    const visit = new Visitor({        
        name: name, 
        count: 1                  
    });

    if (name === 'Anónimo') {
        await visit.save((error) => {
            if (error) {
                console.log(error);
                return;
            }
          console.log("Visit created"); 
        });
    }else{
        await Visitor.findOne({ "name": req.query.name }, async function(error, result){
            if (error) return console.error(error);           

            if (result) {
                console.log(result.count);
                result.count += 1;
                await result.save(function(error){
                    if (error) return console.error(error);
                });               
            }else{
                await visit.save((error) => {
                    if (error) {
                        console.log(error);
                        return;
                    }
                  console.log("Visit created"); 
                });
            };
        });
    };

    Visitor.find({}, function(error, result){
        if (error) return console.error(error);
        console.log(result);
        let str= '';
        
        for (const visit of result) { 
            console.log('visit',visit);
            str = str +`<tr>
                        <td>${visit.id}</td>
                        <td>${visit.name}</td>
                        <td>${visit.count}</td>
                        </tr>`; 
                                             
        };    

        res.send(`<table>
            <thead>
                <tr>
                    <th>Id</th>
                    <th>Name</th>
                    <th>Visits</th>
                </tr>
            </thead>
            <tbody>               
                ${str}               
            </tbody>               
        </table>`);                
    });       
});

app.listen(port, () => console.log(`Listening on port ${port}`));


