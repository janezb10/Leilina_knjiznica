const express = require("express");
const { route } = require("express/lib/application");
const router = express.Router();
const mysql = require('mysql2');
const Joi = require('joi');
const { append } = require("express/lib/response");

/*ell0*/

router.use(express.json());

const connection = mysql.createConnection({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    database: process.env.SQL_DATABASE,
    password: process.env.SQL_PASSWORD,
    port: process.env.SQL_PORT
});



/* IŠČI KNJIGI IN DOBI SEZNAM KNJIG KI USTREZAJO KRITERIJU */
router.get('/search', async (req, res) => {
    /* check input */
    const schema = Joi.object({
        keyword: Joi.string().min(0).max(91).required()
    });
    try {
        const value = await schema.validateAsync(req.query);
    }
    catch (err) {
        return res.status(400).send();
    }

    /* connect to database and return result */
    connection.query(
        `select id, avtor, naslov from Leilina_knjiznica where avtor like "%${req.query.keyword}%"`,
        function (err, results, fields) {
            console.log(results);
            if (results.length == 0) return res.status(404).send();
            res.status(200).send(results);
        }
    );
})


/* PRIDOBI KNJIGO Z DOLOČENIM IDJEM */
router.get('/bookID', async (req, res) => {
    /* check input */
    const schema = Joi.object({
        id: Joi.number().min(0).required()
    });
    try {
        const value = await schema.validateAsync(req.query);
    }
    catch (err) {
        return res.status(400).send();
    }
    /* connect to database and return result*/
    connection.query(
        `select * from Leilina_knjiznica where id = ${req.query.id}`,
        function (err, results, fields) {
            console.log(results);
            if (results.length == 0) return res.status(404).send();
            res.status(200).send(results);
        }
    );
})

/* NOVA KNJIGA */
router.post('/newBook', async (req, res) => {
    /* preveri če je req.body kull */
    const schema = Joi.object({
        podrocje: Joi.number()
            .min(0)
            .max(9)
            .integer()
            .required(),
        podpodrocje: Joi.number()
            .min(0)
            .max(14)
            .integer()
            .required(),
        naslov: Joi.string()
            .min(1)
            .max(91)
            .required(),
        avtor: Joi.string()
            .min(1)
            .max(91)
            .required(),
        poz: Joi.number()
            .min(0)
            .max(4)
            .integer()
            .required(),
        jezik: Joi.number()
            .min(0)
            .max(4)
            .integer()
            .required(),
        zbirka: Joi.string()
            .max(28),
        drzava: Joi.string()
            .max(21)
            .alphanum(),
        opombe: Joi.string()
            .max(80),
        leto: Joi.number()
            .integer()
    });
    try {
        const o = await schema.validateAsync(req.body);
    }
    catch (err) {
        return res.status(400).send(err);
    }

    connection.query(
        `INSERT INTO Leilina_knjiznica 
        (podrocje, podpodrocje, naslov, avtor, poz, jezik, zbirka, drzava, opombe, leto) 
        VALUES ("${req.body.podrocje}", 
        "${req.body.podpodrocje}", 
        "${req.body.naslov}", 
        "${req.body.avtor}", 
        "${req.body.poz}", 
        "${req.body.jezik}", 
        "${req.body.zbirka}", 
        "${req.body.drzava}", 
        "${req.body.opombe}", 
        "${req.body.leto}");`,
        function (err, results, fields) {
            console.log(err);
            console.log(results);
            if (!err) res.send(req.body);
        }
    )
})

/* POSODOBI PODATKE KNJIGI Z IDJEM */
router.put('/updateBook/:id', async (req, res) => {
    const schemap = Joi.object({
        id: Joi.number()
            .integer()
    });
    const schemab = Joi.object({
        podrocje: Joi.number()
            .min(0)
            .max(9)
            .integer()
            .required(),
        podpodrocje: Joi.number()
            .min(0)
            .max(14)
            .integer()
            .required(),
        naslov: Joi.string()
            .min(1)
            .max(91)
            .required(),
        avtor: Joi.string()
            .min(1)
            .max(91)
            .required(),
        poz: Joi.number()
            .min(0)
            .max(4)
            .integer()
            .required(),
        jezik: Joi.number()
            .min(0)
            .max(4)
            .integer()
            .required(),
        zbirka: Joi.string()
            .max(28),
        drzava: Joi.string()
            .max(21)
            .alphanum(),
        opombe: Joi.string()
            .max(80),
        leto: Joi.number()
            .integer()
    });

    try {
        const valuep = await schemap.validateAsync(req.params);
        connection.query(
            `SELECT * from Leilina_knjiznica WHERE id = ${valuep.id};`,
            function (err, results, fields) {
                if (results.length == 0) return res.status(404).send();
                if (err) throw err;
            }
        )

        const vb = await schemab.validateAsync(req.body);
        connection.query(
            `UPDATE Leilina_knjiznica 
            SET 
            podrocje = "${vb.podrocje}", 
            podpodrocje = "${vb.podpodrocje}", 
            naslov = "${vb.naslov}", 
            avtor = "${vb.avtor}", 
            poz = "${vb.poz}", 
            jezik = "${vb.jezik}", 
            zbirka = "${vb.zbirka}", 
            drzava = "${vb.drzava}", 
            opombe = "${vb.opombe}", 
            leto = "${vb.leto}" 
            WHERE id = ${valuep.id};`,
            function (err, results, fields) {
                console.log(err);
                if (!err) return res.send(vb);
                res.send(err);
            }
        )

    }
    catch (err) {
        return res.status(400).send(err);
        console.log('aa :', err);
    }
})



/* ZBRIŠI KNJIGO ČE JO POJE PES */
router.delete('/deleteBook/:id', async (req, res) => {
    const schema = Joi.object({
        id: Joi.number()
            .integer()
    });
    try {
        const value = await schema.validateAsync(req.params);
        connection.query(
            `DELETE FROM Leilina_knjiznica WHERE id = ${value.id};`,
            function (err, results, fields) {
                if (!err) res.send(results);
            }
        )
    }
    catch (err) {
        return res.status(400).send(err);
    }
})





module.exports = router;
