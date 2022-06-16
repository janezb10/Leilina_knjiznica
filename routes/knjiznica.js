const express = require("express");
const { route } = require("express/lib/application");
const router = express.Router();
const mysql = require('mysql2');
const Joi = require('joi');
const db = require('../config/db');

/* kaj je to? lahko zbrišem? */
/* const { append } = require("express/lib/response"); */


/* IŠČI KNJIGI IN DOBI SEZNAM KNJIG KI USTREZAJO KRITERIJU */
router.get('/search', async (req, res, next) => {
    try {
        /* check input */
        const schema = Joi.object({
            keyword: Joi.string().min(0).max(91).required()
        });
        const value = await schema.validateAsync(req.query);
        const sql = `
            SELECT id, naslov, avtor, jezik, zbirka, drzava, leto, podrocje, podpodrocje, pozicija, opombe
            FROM (((Leilina_knjiznica lk 
            INNER JOIN podrocje pod 
                ON lk.id_podrocje = pod.id_podrocje 
                AND lk.id_podpodrocje = pod.id_podpodrocje) 
            INNER JOIN jezik je 
                ON lk.id_jezik = je.id_jezik) 
            INNER JOIN pozicija poz 
                ON lk.id_pozicija = poz.id_pozicija) 
            WHERE avtor 
                LIKE ?`;
        const [rows] = await db.execute(sql, [`%${req.query.keyword}%`]);
        if (rows.length == 0) throw new Error('Ne najde nič');
        res.send(rows);
    }
    catch (err) {
        next(err);
    }
})

/* PRIDOBI JEZIKE */
router.get('/jeziki', async (req, res, next) => {
    try {
        const sql = `
            SELECT *
            FROM jezik`;
        const [rows] = await db.execute(sql);
        res.send(rows);
    } catch (err) {
        next(err);
    }
})

/* PRIDOBI POZICIJE */
router.get('/pozicije', async (req, res, next) => {
    try {
        const sql = `
            SELECT *
            FROM pozicija`;
        const [rows] = await db.execute(sql);
        res.send(rows);
    } catch (err) {
        next(err);
    }
})

/* PRIDOBI PODROČJA */
router.get('/podrocja', async (req, res, next) => {
    try {
        const sql = `
        SELECT UNIQUE podrocje, id_podrocje
        FROM podrocje`;
        const [rows] = await db.execute(sql);
        res.send(rows);
    } catch (err) {
        next(err);
    }
})

/* PRIDOBI PODROČJA IN PODPODROČJA */
router.get('/podrocjaPodpodrocja', async (req, res, next) => {
    try {
        const sql = `
            SELECT *
            FROM podrocje`;
        const [rows] = await db.execute(sql);
        res.send(rows);
    } catch (err) {
        next(err);
    }
})

/* PRIDOBI KNJIGO Z DOLOČENIM IDJEM */
router.get('/book/:id', async (req, res, next) => {
    /* check input */
    const schema = Joi.object({
        bookID: Joi.number().min(0).required()
    });
    try {
        const value = await schema.validateAsync({ bookID: req.params.id });
        const sql = `
        SELECT id, naslov, avtor, jezik, zbirka, drzava, leto, podrocje, podpodrocje, pozicija, opombe
        FROM (((Leilina_knjiznica lk 
        INNER JOIN podrocje pod 
            ON lk.id_podrocje = pod.id_podrocje 
            AND lk.id_podpodrocje = pod.id_podpodrocje) 
        INNER JOIN jezik je 
            ON lk.id_jezik = je.id_jezik) 
        INNER JOIN pozicija poz 
            ON lk.id_pozicija = poz.id_pozicija) 
        WHERE id = ?;`;
        const [rows] = await db.execute(sql, [req.params.id]);
        if (rows.length == 0) throw new Error('There is no book with that ID');
        res.send(rows);
    }
    catch (err) {
        next(err);
    }
})

/* NOVA KNJIGA */
router.post('/book/new', async (req, res, next) => {
    /* preveri če je req.body kull */
    const schema = Joi.object({
        id_podrocje: Joi.number()
            .min(0)
            .max(9)
            .integer()
            .required(),
        id_podpodrocje: Joi.number()
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
        id_pozicija: Joi.number()
            .min(0)
            .max(4)
            .integer()
            .required(),
        id_jezik: Joi.number()
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

        const sql = `
                    INSERT INTO Leilina_knjiznica 
                    (id_podrocje, id_podpodrocje, naslov, avtor, id_pozicija, id_jezik, zbirka, drzava, opombe, leto)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
        let arr = [req.body.id_podrocje, req.body.id_podpodrocje, req.body.naslov, req.body.avtor, req.body.id_pozicija, req.body.id_jezik, req.body.zbirka || "NULL", req.body.drzava || "NULL", req.body.opombe || "NULL", req.body.leto || "NULL"];
        console.log(arr);
        const [rows] = await db.execute(sql, arr);
        res.send(rows);
    }
    catch (err) {
        next(err);
    }

})

/* POSODOBI PODATKE KNJIGI Z IDJEM */
router.put('/book/update/:id', async (req, res, next) => {
    const schemap = Joi.object({
        id: Joi.number()
            .integer()
    });
    const schemab = Joi.object({
        id_podrocje: Joi.number()
            .min(0)
            .max(9)
            .integer()
            .required(),
        id_podpodrocje: Joi.number()
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
        id_pozicija: Joi.number()
            .min(0)
            .max(4)
            .integer()
            .required(),
        id_jezik: Joi.number()
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
        const sqlp = `
            SELECT * 
            FROM Leilina_knjiznica 
            WHERE id = ?;`;
        const [rowsp] = await db.execute(sqlp, [valuep.id]);
        if (rowsp.length == 0) throw new Error('book with that id does not exist');
        const vb = await schemab.validateAsync(req.body);
        const sqlb = `
            UPDATE Leilina_knjiznica 
            SET 
            id_podrocje = ?, 
            id_podpodrocje = ?, 
            naslov = ?, 
            avtor = ?, 
            id_pozicija = ?, 
            id_jezik = ?, 
            zbirka = ?, 
            drzava = ?, 
            opombe = ?, 
            leto = ? 
            WHERE id = ?;`;
        const rowsb = await db.execute(sqlb, [vb.id_podrocje, vb.id_podpodrocje, vb.naslov, vb.avtor, vb.id_pozicija, vb.id_jezik, vb.zbirka || 'NULL', vb.drzava || 'NULL', vb.opombe || 'NULL', vb.leto || 'NULL', valuep.id]);
        res.send(rowsb);
    }
    catch (err) {

        next(err);
    }
})



/* ZBRIŠI KNJIGO ČE JO POJE PES */
router.delete('/book/delete/:id', async (req, res, next) => {
    const schema = Joi.object({
        id: Joi.number()
            .integer()
    });
    try {
        const value = await schema.validateAsync(req.params);
        const sql = `
        DELETE FROM Leilina_knjiznica WHERE id = ?;`;
        const [rows] = await db.execute(sql, [value.id]);
        if (rows.affectedRows == 0) throw new Error('Book with that ID does not exist');
        res.send(rows);
    }
    catch (err) {
        next(err);
    }
})





module.exports = router;
