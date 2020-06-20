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
            const results = { 'results': (result) ? result.rows : null};
            res.render('pages/index', results );
            client.release();
        } catch (err) {
            console.error(err);
            res.send("Error " + err);
        }
    })

    .get('/add', (req, res) => {
        res.render('pages/add');
    })

    .post('/added', async (req, res) => {
        var name = req.body.name;
        var size = req.body.size;
        var height = req.body.height;
        var type = req.body.type;

        try {
            const client = await pool.connect();
            await client.query('INSERT INTO person VALUES ($1, $2, $3, $4)', [name, size, height, type]);
            res.render('pages/success');
            client.release();
        } catch (err) {
            console.error(err);
            res.send("Error " + err);
        }
    })
    
    .listen(PORT, () => console.log(`Listening on ${ PORT }`))
