const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 3000;

// Konfigurasi koneksi MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',  // username default XAMPP
    password: '',  // password default XAMPP
    database: 'jurnal_db'  // nama database yang sudah dibuat
});

// Cek koneksi MySQL
db.connect((err) => {
    if (err) {
        console.error('Error koneksi ke database: ', err.stack);
        return;
    }
    console.log('Terhubung ke database MySQL');
});

// Middleware untuk parsing body
app.use(express.urlencoded({ extended: true }));

// Menyajikan file statis (CSS)
app.use(express.static('public'));

// Rute untuk halaman utama
app.get('/', (req, res) => {
    db.query('SELECT * FROM entries ORDER BY created_at DESC', (err, results) => {
        if (err) {
            console.error('Error mengambil data: ', err.stack);
            return res.send('Error mengambil data jurnal');
        }
        res.render('index', { entries: results });
    });
});

// Rute untuk menangani form pengiriman jurnal
app.post('/add-entry', (req, res) => {
    const newEntry = req.body.entry;
    if (newEntry) {
        db.query('INSERT INTO entries (content) VALUES (?)', [newEntry], (err, results) => {
            if (err) {
                console.error('Error menambahkan entri: ', err.stack);
                return res.send('Error menambahkan entri');
            }
            res.redirect('/');
        });
    } else {
        res.redirect('/');
    }
});

// Rute untuk menampilkan halaman edit jurnal
app.get('/edit/:id', (req, res) => {
    const entryId = req.params.id;
    db.query('SELECT * FROM entries WHERE id = ?', [entryId], (err, results) => {
        if (err) {
            console.error('Error mengambil data:', err);
            return res.send('Terjadi kesalahan');
        }
        if (results.length > 0) {
            res.render('edit', { entry: results[0] });
        } else {
            res.send('Entri tidak ditemukan');
        }
    });
});

// Rute untuk update entri jurnal
app.post('/update/:id', (req, res) => {
    const entryId = req.params.id;
    const updatedContent = req.body.content;

    db.query('UPDATE entries SET content = ? WHERE id = ?', [updatedContent, entryId], (err, results) => {
        if (err) {
            console.error('Error mengupdate entri:', err);
            return res.send('Terjadi kesalahan saat update');
        }
        res.redirect('/');
    });
});

// Rute untuk menghapus entri jurnal
app.get('/delete/:id', (req, res) => {
    const entryId = req.params.id;

    db.query('DELETE FROM entries WHERE id = ?', [entryId], (err, results) => {
        if (err) {
            console.error('Error menghapus entri:', err);
            return res.send('Terjadi kesalahan saat menghapus');
        }
        res.redirect('/');
    });
});

// Menentukan template engine
app.set('view engine', 'ejs');

// Menjalankan server
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
