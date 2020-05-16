const express = require("express");
const app = express();
const hbs = require("hbs");
const fs = require("fs");
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 5000

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }))

const persons = [
];

app.set("view engine", "hbs");
hbs.registerPartials(__dirname + "/views/partials");
hbs.registerHelper("getCurrentYear", () => {
    return new Date().getFullYear();
});

app.get("/courses", (req, res) => {
    res.send(courses);
});

app.get("/courses/:id", (req, res) => {
    let course = courses.find(e => e.id === parseInt(req.params.id));
    if (!course) {
        res.send("naiyo");
    }
    res.send(course);
});

//----HOME----

app.get("/", (req, res) => {
    res.render("home.hbs", {
        pageTitle: "HOME画面",
        arrPersons : persons,
    });

});

app.post("/", (req, res) => {
    console.log(req.body);
    res.redirect('/user/' + req.body.user); 
});

app.get("/user/:id", (req, res) => {
    var person = persons.find((e) => e.id === Number(req.params.id));
    res.render("theme.hbs", {
        pageTitle: "お題",
        name: person['name'],
        theme: person['theme'],
    });
});

app.get("/manage", (req, res) => {
    res.render("manage.hbs", {
        pageTitle: "管理画面",
    });
});

app.post("/manage", (req, res) => {
    //console.log(req.body);
    if (req.body.type === 'register') {
        let person = {
            id: persons.length + 1,
            name: req.body.name,
            theme: null,
        };
        persons.push(person)
        res.send(persons);
        //res.redirect('/manage'); 
    }else if(req.body.type === 'allocate'){
        const themes = JSON.parse(fs.readFileSync('./themes.json', 'utf-8'));
        // 乱数の生成
        var min = 1;
        var max = themes.length;
        var rand = Math.floor(Math.random() * (max + 1 - min)) + min;
        // テーマの取得
        var theme = themes.find((e) => e.id === String(rand));

        for(var i = persons.length - 1; i > 0; i--){
            var r = Math.floor(Math.random() * (i + 1));
            var tmp = persons[i];
            persons[i] = persons[r];
            persons[r] = tmp;
        }

        var wolf = req.body.wolf;
        for(var i = 0; i < persons.length; i++){
            if(wolf > 0){
                persons[i]['theme'] = theme['theme2'];
                wolf--;
            }else{
                persons[i]['theme'] = theme['theme1'];
            }
        }

        //console.log(theme);
        //res.send(persons);
        res.redirect('/manage'); 
    }
});

app.listen(PORT);