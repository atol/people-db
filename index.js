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

const { uuid } = require('uuidv4');

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

    .get('/person/:id', async (req, res) => {
        var id = req.params.id;
        try {
            const client = await pool.connect();
            const result = await client.query('SELECT * FROM person WHERE id=$1', [id]);
            const results = {'results': (result) ? result.rows : null};
            res.render('pages/person', results);
            client.release();
        } catch (err) {
            console.error(err);
            res.render('pages/error', err);
        }
    })

    .get('/person/:id/delete', async (req, res) => {
        var id = req.params.id;
        try {
            const client = await pool.connect();
            const result = await client.query('SELECT * FROM person WHERE id=$1', [id]);
            const results = {'results': (result) ? result.rows : null};
            await client.query('DELETE FROM person WHERE id=$1', [id]);
            res.render('pages/success', results);
            client.release();
        } catch (err) {
            console.error(err);
            res.render('pages/error', err);
        }
    })

    .get('/person/:id/edit', async (req, res) => {
        var id = req.params.id;
        try {
            const client = await pool.connect();
            const result = await client.query('SELECT * FROM person WHERE id=$1', [id]);
            const results = {'results': (result) ? result.rows : null};
            res.render('pages/edit', results);
            client.release();
        } catch (err) {
            console.error(err);
            res.render('pages/error', err);
        }
    })

    .post('/added', async (req, res) => {
        var id = uuid();
        var name = req.body.name.toLowerCase();
        var size = req.body.size;
        var height = req.body.height;
        var type = req.body.type;

        try {
            const client = await pool.connect();
            await client.query('INSERT INTO person VALUES ($1, $2, $3, $4, $5)', [id, name, size, height, type]);
            res.redirect('person/' + id);
            client.release();
        } catch (err) {
            console.error(err);
            res.render('pages/error', {error: err});
        }
    })
    
    .post('/edited/:id', async (req, res) => {
        var id = req.params.id;
        var name = req.body.name.toLowerCase();
        var size = req.body.size;
        var height = req.body.height;
        var type = req.body.type;

        try {
            const client = await pool.connect();
            await client.query('UPDATE person SET name=$2, size=$3, height=$4, type=$5 WHERE id=$1', [id, name, size, height, type]);
            res.redirect('/person/' + id);
            client.release();
        } catch (err) {
            console.error(err);
            res.render('pages/error', {error: err});
        }
    })

    .listen(PORT, () => console.log(`Listening on ${ PORT }`))
