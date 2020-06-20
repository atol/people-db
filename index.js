const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

const { Pool } = require('pg');
const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
    connectionString: 'postgres://postgres:root@localhost/people',
    ssl: {
        rejectUnauthorized: false
    }
});

express()
    .use(express.json())
    .use(express.urlencoded({extended:false}))
    .use(express.static(path.join(__dirname, 'public')))
    
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')
    
    .get('/', async (req, res) => {
        try {
            const client = await pool.connect();
            const result = await client.query('SELECT * FROM person');
            const results = {'results': (result) ? result.rows : null};
            res.render('pages/index', results);
            client.release();
        } catch (err) {
            console.error(err);
            res.render('pages/error', err);
        }
    })

    .get('/add', (req, res) => {
        res.render('pages/add');
    })

    .get('/user/:id', async (req, res) => {
        var uid = req.params.id;
        try {
            const client = await pool.connect();
            const result = await client.query('SELECT * FROM person WHERE name=$1', [uid]);
            const results = {'results': (result) ? result.rows : null};
            res.render('pages/user', results);
            client.release();
        } catch (err) {
            console.error(err);
            res.render('pages/error', err);
        }
    })

    .get('/user/:id/delete', async (req, res) => {
        var uid = req.params.id;
        try {
            const client = await pool.connect();
            const result = await client.query('DELETE FROM person WHERE name=$1', [uid]);
            const results = {'results': (result) ? result.rows : null};
            res.render('pages/success', {status: "User `" + uid + "` deleted."});
            client.release();
        } catch (err) {
            console.error(err);
            res.render('pages/error', err);
        }
    })

    .get('/user/:id/edit', async (req, res) => {
        var uid = req.params.id;
        try {
            const client = await pool.connect();
            const result = await client.query('SELECT * FROM person WHERE name=$1', [uid]);
            const results = {'results': (result) ? result.rows : null};
            res.render('pages/edit', results);
            client.release();
        } catch (err) {
            console.error(err);
            res.render('pages/error', err);
        }
    })

    .post('/added', async (req, res) => {
        var name = req.body.name.toLowerCase();
        var size = req.body.size;
        var height = req.body.height;
        var type = req.body.type;

        try {
            const client = await pool.connect();
            await client.query('INSERT INTO person VALUES ($1, $2, $3, $4)', [name, size, height, type]);
            res.render('pages/success', {status: "User `" + name + "` added."});
            client.release();
        } catch (err) {
            console.error(err);
            res.render('pages/error', {error: err});
        }
    })
    
    .post('/edited', async (req, res) => {
        var name = req.body.name.toLowerCase();
        var size = req.body.size;
        var height = req.body.height;
        var type = req.body.type;

        try {
            const client = await pool.connect();
            await client.query('UPDATE person SET name=$1, size=$2, height=$3, type=$4 WHERE name=$1', [name, size, height, type]);
            res.redirect('/user/' + name);
            client.release();
        } catch (err) {
            console.error(err);
            res.render('pages/error', {error: err});
        }
    })

    .listen(PORT, () => console.log(`Listening on ${ PORT }`))
