const express = require("express");
const path = require('path');
const app = express();
const hbs = require("hbs");
const fs = require("fs");
const favicon = require("serve-favicon");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const PORT = process.env.PORT || 5000
const publicPath = path.join(__dirname, '/public');

hbs.registerPartials(__dirname + "/views/partials");
app.use('/', express.static(publicPath));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(methodOverride('_method'));
app.use(favicon(publicPath + '/images/favicon.ico'));

app.use((req, res, next) => {
    if(Object.keys(req.query).length === 0 && req.url.indexOf('?') > 0){
        target = req.url.replace('?', '');
        res.redirect(target);
    }else{
        next();
    }
})

let persons = [];
let theme;

app.set("view engine", "hbs");

app.get("/", (req, res) => {
    res.render("home.hbs", {
        arrPersons : persons,
    });
});

app.post("/", (req, res) => {
    if (req.body.type === 'check') {
        res.redirect('/user/' + req.body.user);
    }
});

app.get("/manage", (req, res) => {
    res.render("manage.hbs", {
        arrPersons : persons,
        theme1 : theme ? theme['theme1'] : 'Not allocated',
        theme2 : theme ? theme['theme2'] : 'Not allocated',
    });
});

app.post("/manage", (req, res) => {
    if (req.body.type === 'register') {
        if (persons.find((e) => e.name === req.body.name) == null) {
            let person = {
                id: getNewId(),
                name: req.body.name,
                isWolf: false,
            };
            persons.push(person);

            res.redirect('/manage');
        } else {
            res.send("同名のユーザが存在します。");
        }
    } else if (req.body.type === 'allocate') {
        theme = getRandomTheme();

        let wolfArray = [];
        var wolf = req.body.wolf;
        for (var i = 0; i < persons.length; i++) {
            if (wolf > 0) {
                wolfArray.push(true);
                wolf--;
            } else {
                wolfArray.push(false);
            }
        }

        wolfArray = shuffle(wolfArray);

        for (var i = 0; i < persons.length; i++) {
            persons[i]['isWolf'] = wolfArray[i];
        }

        res.redirect('/manage');
    }
});

app.get("/user/:id", (req, res) => {
    const person = persons.find((e) => e.id === Number(req.params.id));

    if (theme) {
        res.render("theme.hbs", {
            name: person['name'],
            theme: person['isWolf'] ? theme['theme2'] : theme['theme1'],
        });
    } else {
        res.send("お題が設定されていません。");
    }
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

function getRandomTheme() {
    const themes = JSON.parse(fs.readFileSync('./themes.json', 'utf-8'));
    const min = 1;
    const max = themes.length;
    const themeId = Math.floor(Math.random() * (max - min + 1)) + min;
    // ランダムのお題を取得
    const themeTmp = themes.find((e) => e.id === String(themeId));
    const randomBool = Math.random() >= 0.5;

    return {
        theme1 : randomBool ? themeTmp['theme1'] : themeTmp['theme2'],
        theme2 : randomBool ? themeTmp['theme2'] : themeTmp['theme1'],
    }
}
