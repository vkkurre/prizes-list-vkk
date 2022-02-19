const express= require('express');
const app=express();
const path=require("path");
const port = process.env.port || 3000;
const hbs=require("hbs");
const requests= require("requests");
const static_path= path.join(__dirname,"../public");
const view_path= path.join(__dirname,"../templates/views");
const partials_path= path.join(__dirname,"../templates/partials");

app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", view_path);
hbs.registerPartials(partials_path);


//Function to fetch prizes from the url
app.get("/", (req,res)=>{
    var data_from_api='';
    var lrts=[];
    var lrtsids=[];
    var lrts_mult_wins=[];
    var laureate=[];
    requests('http://api.nobelprize.org/v1/prize.json')
    .on('data', function (chunk) {
        data_from_api+=chunk
        const parsedData=JSON.parse(data_from_api); //Got all the data to parsedData variable.
        for(var i in parsedData.prizes){
            lrts.push(parsedData.prizes[i].laureates);
        }
        for(var j in lrts){
            for(var k in lrts[j]){
                lrtsids.push(lrts[j][k].id);
            }
        }
        const toFindDuplicates = lrtsids => lrtsids.filter((item, index) => lrtsids.indexOf(item) !== index)
        const duplicateElements = toFindDuplicates(lrtsids);
        var distinctE=[...new Set(duplicateElements)];
        for(var m in distinctE){
            for(var j in lrts){
                for(var k in lrts[j]){
                    if(lrts[j][k].id==distinctE[m]){
                    lrts_mult_wins.push(lrts[j][k].firstname+' '+lrts[j][k].surname);
                    }
                }
            }
        }
        var distinctName=[...new Set(lrts_mult_wins)];
        distinctName.splice(3,1);
        distinctName.splice(3,1);
        for(var k in distinctName){
            laureate.push({name:distinctName[k]});
        }
        res.status(201).render("index",{prizes:parsedData.prizes,laureates:laureate});
    })
    .on('end', function (err) {
    if (err) return console.log('connection closed due to errors', err);
    console.log('end');
    });
});

app.post("/", async(req,res)=>{
    try{
        var selCat=req.body.selCategory;
        var lowselCat=selCat.toLowerCase();
        const yearSel=req.body.yearSel;
        var result=[];
        var data_from_api='';
        var lrts=[];
        var lrtsids=[];
        var lrts_mult_wins=[];
        var laureate=[];
        requests('http://api.nobelprize.org/v1/prize.json')
        .on('data', function (chunk) {
            data_from_api+=chunk
            const parsedData=JSON.parse(data_from_api); //Got all the data to parsedData variable.
            if(selCat=='All'){
               for(var i in parsedData.prizes){
                if(parsedData.prizes[i].year==yearSel){
                    result.push(parsedData.prizes[i]);
                }
               }
            }
            else{
                for(var i in parsedData.prizes){
                    if(parsedData.prizes[i].year==yearSel && parsedData.prizes[i].category==lowselCat){
                        result.push(parsedData.prizes[i]);
                    }
                }
            }
            for(var i in parsedData.prizes){
                lrts.push(parsedData.prizes[i].laureates);
            }
            for(var j in lrts){
                for(var k in lrts[j]){
                    lrtsids.push(lrts[j][k].id);
                }
            }
            const toFindDuplicates = lrtsids => lrtsids.filter((item, index) => lrtsids.indexOf(item) !== index)
            const duplicateElements = toFindDuplicates(lrtsids);
            var distinctE=[...new Set(duplicateElements)];
            for(var m in distinctE){
                for(var j in lrts){
                    for(var k in lrts[j]){
                        if(lrts[j][k].id==distinctE[m]){
                        lrts_mult_wins.push(lrts[j][k].firstname+' '+lrts[j][k].surname);
                        }
                    }
                }
            }
            var distinctName=[...new Set(lrts_mult_wins)];
            distinctName.splice(3,1);
            distinctName.splice(3,1);
            for(var k in distinctName){
                laureate.push({name:distinctName[k]});
            }
            res.status(201).render("index",{prizes:result,laureates:laureate});
        })
        .on('end', function (err) {
        if (err) return console.log('connection closed due to errors', err);
        console.log('end');
        });
    }catch{
        res.status(400).render("error");
    }
});


app.get("/about",(req, res)=>{
    res.status(201).render("about");
})
app.listen(port, ()=>{
    console.log(`Listening to ${port}`);
});