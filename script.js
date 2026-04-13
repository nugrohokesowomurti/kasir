async function fetchDariSheet() {
    try {
        const response = await fetch(SCRIPT_URL);
        const data = await response.json();
        
        // Simpan ke variabel global dan LocalStorage sebagai backup
        dataLokal = data; 
        localStorage.setItem('stokBarang', JSON.stringify(data));
        
        console.log("Data terbaru berhasil diambil dari Spreadsheet");
        return data;
    } catch (error) {
        console.error("Gagal sinkronisasi dengan Spreadsheet:", error);
        // Jika gagal (offline), gunakan data cadangan
        dataLokal = JSON.parse(localStorage.getItem('stokBarang')) || [];
        return dataLokal;
    }
}

// ==========================================
// KONFIGURASI SPREADSHEET
// ==========================================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby3whXTrcpHvCpsM3mO7fx2LacTgEZJokJ3-r7Wp7sGalxCSn5KwEUIcdZMCWlsSwvv/exec"; 

const addButton = document.querySelector('.addButton');
const tableBody = document.getElementById('tableBody'); 

let dataLokal = [];

// 1. FUNGSI AMBIL DATA (SINKRONISASI AWAL)
window.onload = async () => {
    if (tableBody) {
        tableBody.innerHTML = "<tr><td colspan='9' style='text-align:center;'>Menghubungkan ke server...</td></tr>";
    }
    
    const dataTerbaru = await fetchDariSheet();
    
    // Simpan data terbaru dari server ke LocalStorage agar keduanya sinkron
    if (dataTerbaru && dataTerbaru.length > 0) {
        localStorage.setItem('stokBarang', JSON.stringify(dataTerbaru));
        console.log("LocalStorage telah disinkronkan dengan data Spreadsheet.");
    }

    renderTabel();
    if (typeof updateDatalist === "function") updateDatalist();
};

// 2. FUNGSI KIRIM DATA KE CLOUD
async function kirimKeSheet(data) {
    try {
        const response = await fetch(SCRIPT_URL, {
            method: "POST",
            body: JSON.stringify(data)
        });
        const result = await response.json();
        console.log("Respon Server:", result);
        return result;
    } catch (error) {
        console.error("Error saat kirim ke Sheet:", error);
    }
}

// 3. RENDER TABEL (UNTUK HALAMAN STOCK)
function renderTabel(filterText = "") {
    if (!tableBody) return;
    tableBody.innerHTML = "";
    
    let search = filterText.toLowerCase();

    dataLokal.forEach((item, index) => {
        let namaBarang = (item.nama || item.namabarang || "Tanpa Nama").toString();
        let jenisBarang = (item.jenis || item.jenisbarang || "-").toString();

        if (namaBarang.toLowerCase().includes(search) || jenisBarang.toLowerCase().includes(search)) {
            let jml = item.jumlah !== undefined ? item.jumlah : (item.jumlahbarang || 0);
            let beli = item.beli || item.hargabeli || 0;
            let jual = item.jual || item.hargajual || 0;
            
            let hrgBeliFmt = "Rp " + Number(beli).toLocaleString('id-ID');
            let hrgJualFmt = "Rp " + Number(jual).toLocaleString('id-ID');

            tableBody.innerHTML += `<tr>
                <td>${index + 1}</td>
                <td>${namaBarang}</td>
                <td>${jml}</td>
                <td>${jenisBarang}</td>
                <td>${hrgBeliFmt}</td> 
                <td>${hrgJualFmt}</td> 
                <td>${item.kadaluarsa || "-"}</td>
                <td>${item.tanggalmasuk || item.tanggal || "-"}</td>
                <td>
                    <button class="editBtn" onclick="mulaiEdit(${index})">Edit</button>
                    <button class="dltBtn" onclick="hapusBarang(${index})">Hapus</button>
                    <button class="tmbhBarang" onclick="tambahStok(${index})">+ Stok</button> 
                </td>
            </tr>`;
        }
    });

    if (tableBody.innerHTML === "" && filterText !== "") {
        tableBody.innerHTML = `<tr><td colspan="9">Barang "${filterText}" tidak ditemukan.</td></tr>`;
    }
}

// 4. EVENT LISTENER SAAT HALAMAN DIBUKA
window.onload = async () => {
    if (tableBody) {
        tableBody.innerHTML = "<tr><td colspan='9' style='text-align:center;'>Menghubungkan ke server...</td></tr>";
    }
    await fetchDariSheet();
    renderTabel();
    if (typeof updateDatalist === "function") updateDatalist();
};

// 5. TAMBAH BARANG BARU
if (addButton) {
    addButton.onclick = async function() {
        let nama = prompt("Nama Barang:");
        if (!nama) return;
        let jumlah = prompt("Jumlah:", "0");
        let jenis = prompt("Jenis Barang:");
        let beli = prompt("Harga Beli:", "0");
        let jual = prompt("Harga Jual:", "0");

        let barangBaru = {
            action: "add", // Beritahu script di GS bahwa ini data baru
            nama: nama,
            jumlah: parseInt(jumlah),
            jenis: jenis, 
            beli: parseInt(beli),
            jual: parseInt(jual),
            kadaluarsa: prompt("Tanggal Kadaluarsa (opsional):"),
            tanggalmasuk: new Date().toLocaleDateString('id-ID')
        };

        dataLokal.push(barangBaru);
        renderTabel();
        await kirimKeSheet(barangBaru);
        localStorage.setItem('stokBarang', JSON.stringify(dataLokal));
    };
}

window.mulaiEdit = async function(index) {
    let b = dataLokal[index];
    
    let namaBaru = prompt("Ubah Nama Barang:", b.nama || b.namabarang);
    if (namaBaru === null) return; 

    let jmlBaru = prompt("Ubah Jumlah Stok:", b.jumlah || b.jumlahbarang || 0);
    let jenisBaru = prompt("Ubah Jenis Barang:", b.jenis || b.jenisbarang || "-");
    let beliBaru = prompt("Ubah Harga Beli:", b.beli || b.hargabeli || 0);
    let jualBaru = prompt("Ubah Harga Jual:", b.jual || b.hargajual || 0);
    let expiredBaru = prompt("Ubah Tanggal Kadaluarsa:", b.kadaluarsa || "-");
    let tglMasukBaru = prompt("Ubah Tanggal Masuk:", b.tanggalmasuk || b.tanggal || "-");

    // Update data lokal dengan nama properti yang konsisten
    dataLokal[index] = {
        nama: namaBaru,
        jumlah: parseInt(jmlBaru) || 0,
        jenis: jenisBaru,
        beli: parseInt(beliBaru) || 0,
        jual: parseInt(jualBaru) || 0,
        kadaluarsa: expiredBaru,
        tanggalmasuk: tglMasukBaru
    };

    renderTabel();

    // KIRIM KE SHEET: Pastikan action adalah "edit" dan index disertakan
    await kirimKeSheet({ 
        action: "edit", 
        index: index, 
        ...dataLokal[index] 
    });

    localStorage.setItem('stokBarang', JSON.stringify(dataLokal));
}

// 7. TAMBAH STOK
window.tambahStok = async function(index) {
    let barang = dataLokal[index];
    let namaBarang = barang.nama || barang.namabarang;
    let inputTambahan = prompt(`Tambah stok untuk "${namaBarang}":`, "0");

    if (inputTambahan === null || inputTambahan === "" || isNaN(inputTambahan)) return;

    let qtyTambahan = parseInt(inputTambahan);
    
    // Update lokal
    if (barang.jumlah !== undefined) {
        barang.jumlah = parseInt(barang.jumlah) + qtyTambahan;
    } else {
        barang.jumlahbarang = (parseInt(barang.jumlahbarang) || 0) + qtyTambahan;
    }

    renderTabel();

    // SINKRONISASI: Pastikan action adalah "edit"
    await kirimKeSheet({
        action: "edit", // <--- INI KUNCINYA agar tidak jadi baris baru
        index: index,   // <--- Menentukan baris mana yang diupdate
        nama: barang.nama || barang.namabarang,
        jumlah: barang.jumlah || barang.jumlahbarang,
        jenis: barang.jenis || barang.jenisbarang,
        beli: barang.beli || barang.hargabeli,
        jual: barang.jual || barang.hargajual,
        kadaluarsa: barang.kadaluarsa,
        tanggalmasuk: barang.tanggalmasuk || barang.tanggal
    });

    localStorage.setItem('stokBarang', JSON.stringify(dataLokal));
}

// 7. HAPUS BARANG
window.hapusBarang = async function(index) {
    if (confirm("Hapus barang ini secara permanen?")) {
        dataLokal.splice(index, 1);
        renderTabel();
        await kirimKeSheet({ action: "delete", index: index });
        localStorage.setItem('stokBarang', JSON.stringify(dataLokal));
    }
}

// 8. SEARCH INPUT (Jika ada input id="cariInput")
const cariInput = document.getElementById('cariInput');
if (cariInput) {
    cariInput.addEventListener('input', function() {
        renderTabel(this.value);
    });
}

// ==========================================
// LOGIKA KHUSUS HALAMAN LIST (VIEW ONLY)
// ==========================================

// Fungsi untuk menampilkan data khusus di tabel List
async function tampilkanDataList(filterText = "") {
    const tableBodyList = document.getElementById('tableBodyList');
    if (!tableBodyList) return; // Berhenti jika bukan di halaman list.html

    // Gunakan data yang sudah ada di memori atau ambil baru
    let list = dataLokal.length > 0 ? dataLokal : await fetchDariSheet();
    let search = filterText.toLowerCase();

    tableBodyList.innerHTML = "";

    list.forEach((item, index) => {
        let namaBarang = (item.nama || item.namabarang || "").toString();
        let jenisBarang = (item.jenis || item.jenisbarang || "-").toString();

        if (namaBarang.toLowerCase().includes(search) || jenisBarang.toLowerCase().includes(search)) {
            let jml = item.jumlah || item.jumlahbarang || 0;
            let hargaJualFmt = "Rp " + Number(item.jual || item.hargajual || 0).toLocaleString('id-ID');

            tableBodyList.innerHTML += `<tr>
                <td>${index + 1}</td>
                <td>${namaBarang}</td>
                <td>${jml}</td>
                <td>${jenisBarang}</td>
                <td>${hargaJualFmt}</td> 
                <td>${item.kadaluarsa || "-"}</td>
            </tr>`;
        }
    });

    if (tableBodyList.innerHTML === "") {
        tableBodyList.innerHTML = `<tr><td colspan="6" style="text-align:center;">Data tidak ditemukan</td></tr>`;
    }
}

// Inisialisasi khusus untuk halaman List saat dimuat
if (document.getElementById('tableBodyList')) {
    window.addEventListener('load', async () => {
        const tableBodyList = document.getElementById('tableBodyList');
        tableBodyList.innerHTML = "<tr><td colspan='6' style='text-align:center;'>Menghubungkan ke server...</td></tr>";
        
        await fetchDariSheet();
        tampilkanDataList();
    });

    // Hubungkan juga dengan input pencarian di halaman list
    const cariInputList = document.getElementById('cariInput');
    if (cariInputList) {
        cariInputList.addEventListener('input', function() {
            tampilkanDataList(this.value);
        });
    }
}

// ==========================================
// LOGIKA KASIR (index.html)
// ==========================================
let keranjang = [];
const productInput = document.getElementById('productInput');
const cartBody = document.getElementById('cartBody');
const grandTotalEl = document.getElementById('grandTotal');

// Fungsi mengisi otomatis pilihan produk (Datalist)
function updateDatalist() {
    const suggestions = document.getElementById('productSuggestions');
    if (!suggestions) return;
    
    // Gunakan dataLokal dari spreadsheet atau localStorage
    const listBarang = dataLokal.length > 0 ? dataLokal : JSON.parse(localStorage.getItem('stokBarang')) || [];
    suggestions.innerHTML = "";
    
    listBarang.forEach(item => {
        let nama = item.nama || item.namabarang;
        if (nama) {
            let option = document.createElement('option');
            option.value = nama;
            suggestions.appendChild(option);
        }
    });
}

// Event saat tombol "Tambah" di kasir diklik
const btnAddKasir = document.getElementById('addBtn');
if (btnAddKasir) {
    updateDatalist();
    btnAddKasir.onclick = function() {
        const namaCari = productInput.value;
        const qty = parseInt(document.getElementById('qtyInput').value) || 0;
        const listBarang = dataLokal.length > 0 ? dataLokal : JSON.parse(localStorage.getItem('stokBarang')) || [];

        const produk = listBarang.find(item => 
            (item.nama || item.namabarang || "").toLowerCase() === namaCari.toLowerCase()
        );

        if (produk) {
            let stokTersedia = parseInt(produk.jumlah || produk.jumlahbarang || 0);
            if (stokTersedia < qty) return alert("Stok tidak mencukupi! (Sisa: " + stokTersedia + ")");
            if (qty <= 0) return alert("Masukkan jumlah yang valid!");

            keranjang.push({
                nama: produk.nama || produk.namabarang,
                harga: parseInt(produk.jual || produk.hargajual || 0),
                qty: qty,
                subtotal: parseInt(produk.jual || produk.hargajual || 0) * qty
            });

            updateKeranjang();
            productInput.value = "";
            document.getElementById('qtyInput').value = 1;
        } else {
            alert("Produk tidak ditemukan!");
        }
    };
}

function updateKeranjang() {
    if (!cartBody) return;
    cartBody.innerHTML = "";
    let total = 0;

    keranjang.forEach((item, index) => {
        total += item.subtotal;
        cartBody.innerHTML += `
            <tr>
                <td>${item.nama}</td>
                <td>Rp ${item.harga.toLocaleString('id-ID')}</td>
                <td>${item.qty}</td>
                <td>Rp ${item.subtotal.toLocaleString('id-ID')}</td>
                <td><button onclick="hapusItemKeranjang(${index})" style="background:red; color:white; border:none; padding:2px 8px; cursor:pointer;">X</button></td>
            </tr>`;
    });
    if (grandTotalEl) grandTotalEl.innerText = "Rp " + total.toLocaleString('id-ID');
}

window.hapusItemKeranjang = function(index) {
    keranjang.splice(index, 1);
    updateKeranjang();
};

// ==========================================
// LOGIKA CHECKOUT & SIMPAN LAPORAN (FIXED)
// ==========================================
const checkoutBtn = document.getElementById('checkoutBtn');
if (checkoutBtn) {
    checkoutBtn.onclick = async function() {
        if (keranjang.length === 0) return alert("Keranjang kosong!");
        
        let listBarang = dataLokal.length > 0 ? dataLokal : JSON.parse(localStorage.getItem('stokBarang')) || [];
        let historiPenjualan = JSON.parse(localStorage.getItem('laporanPenjualan')) || [];
        const waktu = new Date();
        const idTrx = "TRX-" + waktu.getTime();

        // 1. Proses Keranjang
        keranjang.forEach(item => {
            historiPenjualan.push({
                id: idTrx,
                tanggal: waktu.toLocaleDateString('id-ID'),
                jam: waktu.toLocaleTimeString('id-ID'),
                nama: item.nama,
                harga: item.harga,
                qty: item.qty,
                total: item.subtotal
            });

            // 2. Potong Stok
            let itemStok = listBarang.find(s => (s.nama || s.namabarang) === item.nama);
            if (itemStok) {
                // Menangani perbedaan nama properti (jumlah vs jumlahbarang)
                if (itemStok.jumlah !== undefined) {
                    itemStok.jumlah = parseInt(itemStok.jumlah) - item.qty;
                } else {
                    itemStok.jumlahbarang = parseInt(itemStok.jumlahbarang) - item.qty;
                }
            }
        });

        // 3. Update Status Lokal
        dataLokal = listBarang; 
        localStorage.setItem('stokBarang', JSON.stringify(listBarang));
        localStorage.setItem('laporanPenjualan', JSON.stringify(historiPenjualan));

        // 4. Sinkronisasi ke Spreadsheet
        // Pastikan SCRIPT_URL menggunakan huruf besar sesuai konfigurasi di atas
        try {
            const updateStatus = await fetch(SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'updateAll', data: listBarang })
            });

            alert("Pembayaran Berhasil! Stok di Spreadsheet telah diperbarui.");
        } catch (error) {
            console.error("Gagal sinkron:", error);
            alert("Berhasil simpan lokal, namun gagal update ke Spreadsheet. Cek koneksi.");
        }

        // 5. Reset Tampilan
        keranjang = [];
        updateKeranjang();
        if (typeof renderTabel === "function") renderTabel();
    };
}

// ==========================================
// LOGIKA LAPORAN PENJUALAN (penjualan.html)
// ==========================================
function tampilkanLaporan() {
    const tableBodyPenjualan = document.getElementById('tableBodyPenjualan');
    if (!tableBodyPenjualan) return;
    
    let histori = JSON.parse(localStorage.getItem('laporanPenjualan')) || [];
    tableBodyPenjualan.innerHTML = "";

    if (histori.length === 0) {
        tableBodyPenjualan.innerHTML = "<tr><td colspan='6' style='text-align:center;'>Belum ada transaksi</td></tr>";
        return;
    }

    histori.reverse().forEach((trx, index) => {
        tableBodyPenjualan.innerHTML += `
            <tr>
                <td>${trx.id}</td>
                <td>${trx.tanggal} <br> <small>${trx.jam}</small></td>
                <td>${trx.nama}</td>
                <td>${trx.qty}</td>
                <td>Rp ${trx.total.toLocaleString('id-ID')}</td>
                <td>
                    <button class="dltBtn" onclick="hapusPenjualan(${index})" style="background:#e74c3c;">Hapus</button>
                </td>
            </tr>`;
    });
}

// Jalankan fungsi saat halaman dimuat
document.addEventListener('DOMContentLoaded', tampilkanLaporan);

window.hapusPenjualan = function(index) {
    if (confirm("Hapus data transaksi ini?")) {
        let histori = JSON.parse(localStorage.getItem('laporanPenjualan')) || [];
        // Balikkan reverse() untuk mendapatkan index asli
        histori.reverse().splice(index, 1); 
        localStorage.setItem('laporanPenjualan', JSON.stringify(histori));
        tampilkanLaporan();
    }
};

window.onload = async () => {
    if (tableBody) {
        tableBody.innerHTML = "<tr><td colspan='9' style='text-align:center;'>Sinkronisasi data...</td></tr>";
    }
    
    // Ambil data terbaru dari Spreadsheet
    await fetchDariSheet();
    
    // Setelah data didapat, baru tampilkan ke tabel
    renderTabel();
    
    if (typeof updateDatalist === "function") updateDatalist();
};