const express = require("express");
const app = express();
const hbs = require("hbs");
hbs.registerPartials(__dirname + "/views/partials");
const fs = require("fs");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const PORT = process.env.PORT || 5000

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(methodOverride('_method'));

let persons = [];

app.set("view engine", "hbs");

app.get("/", (req, res) => {
    res.render("home.hbs", {
        pageTitle: "HOME画面",
        arrPersons : persons,
    });
});

app.post("/", (req, res) => {
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
        arrPersons : persons,
    });
});

app.post("/manage", (req, res) => {
    if (req.body.type === 'register') {
        if (persons.find((e) => e.name === req.body.name) == null) {
            let person = {
                id: getNewId(),
                name: req.body.name,
                theme: null,
            };
            persons.push(person);
        } else {
            res.send("同名のユーザが存在します。");
        }
    }else if(req.body.type === 'allocate'){
        const themes = JSON.parse(fs.readFileSync('./themes.json', 'utf-8'));
        // 乱数の生成
        var min = 1;
        var max = themes.length;
        var rand = Math.floor(Math.random() * (max + 1 - min)) + min;
        // テーマの取得
        var theme = themes.find((e) => e.id === String(rand));

        persons = shuffle(persons);

        var wolf = req.body.wolf;
        for(var i = 0; i < persons.length; i++){
            if(wolf > 0){
                persons[i]['theme'] = theme['theme2'];
                wolf--;
            }else{
                persons[i]['theme'] = theme['theme1'];
            }
        }

        persons = shuffle(persons);
    }
    res.redirect('/manage');
});

app.delete("/user/:id", (req, res) => {
    // 該当IDのデータを検索
    let person = persons.find((e) => e.id === Number(req.params.id));
    if(!person){
        res.send("該当IDのユーザが見つかりませんでした。");
    }
    // 削除
    let index = persons.indexOf(person);
    persons.splice(index, 1);
    // リダイレクト
    res.redirect('/manage');
});

app.listen(PORT);

function shuffle(arr){
    for(var i = arr.length - 1; i > 0; i--){
        var r = Math.floor(Math.random() * (i + 1));
        var tmp = arr[i];
        arr[i] = arr[r];
        arr[r] = tmp;
    }
    return arr;
}

function getNewId() {
    for(let i = 1; i <= persons.length; i++) {
        const person = persons.find((e) => e.id === i);
        if(!person){
            return i;
        }
    }
    return persons.length + 1;
}
