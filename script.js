// ==========================================
// LOGIKA MANAJEMEN STOK
// ==========================================
// ==========================================
// LOGIKA MANAJEMEN STOK (VERSI PERBAIKAN)
// ==========================================
const addButton = document.querySelector('.addButton');
const tableBody = document.getElementById('tableBody'); // Untuk stock.html
const tableBodyList = document.getElementById('tableBodyList'); // Untuk list.html

if (addButton) {
    addButton.onclick = function() {
        let nama = prompt("Masukkan Nama Barang:");
        let jumlah = prompt("Masukkan Jumlah Barang:");
        let jenis = prompt("Masukkan Jenis Barang:");
        let hargaBeli = prompt("Masukkan Harga Beli Barang:");
        let hargaJual = prompt("Masukkan Harga Jual Barang:");
        let kadaluarsa = prompt("Masukkan Tanggal Kadaluarsa Barang:");

        if (nama && jumlah) {
            let barangBaru = {
                nama: nama,
                jumlah: jumlah,
                jenis: jenis, 
                beli: hargaBeli,
                jual: hargaJual,
                kadaluarsa: kadaluarsa,
                tanggal: new Date().toLocaleDateString('id-ID') // Format tanggal lokal
            };
            saveToLocal(barangBaru);
            tampilkanData();
        }
    };
}

function saveToLocal(item){
    let listBarang = JSON.parse(localStorage.getItem('stokBarang')) || [];
    listBarang.push(item);
    localStorage.setItem('stokBarang', JSON.stringify(listBarang));
}

// SATU FUNGSI UNTUK SEMUA HALAMAN (STOCK & LIST)
function tampilkanData(filterText = ""){
    let listBarang = JSON.parse(localStorage.getItem('stokBarang')) || [];
    let search = filterText.toLowerCase();

    // LOGIKA UNTUK HALAMAN STOCK.HTML (Ada tombol edit/hapus)
    if (tableBody) {
        tableBody.innerHTML = ""; 
        listBarang.forEach((item, index) =>{
            if (item.nama.toLowerCase().includes(search)) {
                let hargaBeliFmt = "Rp " + Number(item.beli).toLocaleString('id-ID');
                let hargaJualFmt = "Rp " + Number(item.jual).toLocaleString('id-ID');

                tableBody.innerHTML += `<tr>
                    <td>${index + 1}</td>
                    <td>${item.nama}</td>
                    <td>${item.jumlah}</td>
                    <td>${item.jenis}</td>
                    <td>${hargaBeliFmt}</td> 
                    <td>${hargaJualFmt}</td> 
                    <td>${item.kadaluarsa}</td>
                    <td>${item.tanggal}</td>
                    <td>
                        <button class="editBtn" onclick="mulaiEdit(${index})">Edit</button>
                        <button class="dltBtn" onclick="hapusBarang(${index})">Hapus</button>
                        <button class="tmbhBarang" onclick="tambahBarang(${index})">tambah barang</button>
                    </td>
                </tr>`;
            }
        });
    }

    // LOGIKA UNTUK HALAMAN LIST.HTML (Hanya tampilan simpel)
    if (tableBodyList) {
        tableBodyList.innerHTML = ""; 
        listBarang.forEach((item, index) =>{
            if (item.nama.toLowerCase().includes(search)) {
                let hargaJualFmt = "Rp " + Number(item.jual).toLocaleString('id-ID');

                tableBodyList.innerHTML += `<tr>
                    <td>${index + 1}</td>
                    <td>${item.nama}</td>
                    <td>${item.jumlah}</td>
                    <td>${item.jenis}</td>
                    <td>${hargaJualFmt}</td> 
                    <td>${item.kadaluarsa}</td>
                </tr>`;
            }
        });
    }
}

// Tambahkan "window." agar fungsi bisa dipanggil dari HTML onclick
window.mulaiEdit = function(index) {
    let listBarang = JSON.parse(localStorage.getItem('stokBarang')) || [];
    let barang = listBarang[index];

    let namaBaru = prompt("Ubah nama barang: ", barang.nama);
    let jumlahBaru = prompt("Ubah jumlah barang: ", barang.jumlah);
    let jenisBaru = prompt("Ubah jenis Barang:", barang.jenis);
    let beliBaru = prompt("Ubah harga Beli:", barang.beli);
    let jualBaru = prompt("Ubah harga Jual:", barang.jual);
    let kadaluarsaBaru = prompt("Ubah tanggal kadaluarsa:", barang.kadaluarsa);

    if (namaBaru && jumlahBaru) {
        listBarang[index] = {
            ...barang, // Simpan data lama lainnya
            nama: namaBaru, jumlah: jumlahBaru, jenis: jenisBaru,
            beli: beliBaru, jual: jualBaru, kadaluarsa: kadaluarsaBaru
        };
        localStorage.setItem('stokBarang', JSON.stringify(listBarang));
        tampilkanData();
    }
}

window.hapusBarang = function(index) {
    if (confirm("Apakah anda yakin ingin menghapus barang ini?")) {
        let listBarang = JSON.parse(localStorage.getItem('stokBarang')) || [];
        listBarang.splice(index, 1);
        localStorage.setItem('stokBarang', JSON.stringify(listBarang));
        tampilkanData();
    }
}

window.tambahBarang = function(index) {
    let listBarang = JSON.parse(localStorage.getItem('stokBarang')) || [];
    let barang = listBarang[index];
    
    // Tanya jumlah tambahan (bukan total baru)
    let inputTambahan = prompt(`Masukkan jumlah stok yang masuk untuk ${barang.nama}:`, "0");
    let kadaluarsaBaru = prompt("Update tanggal kadaluarsa (kosongkan jika tetap):", barang.kadaluarsa);

    // Cek jika user tidak menekan 'Cancel'
    if (inputTambahan !== null && inputTambahan !== "") {
        let jumlahLama = parseInt(barang.jumlah) || 0;
        let tambahan = parseInt(inputTambahan) || 0;

        // Update hanya jumlah dan kadaluarsa
        listBarang[index] = {
            ...barang, 
            jumlah: jumlahLama + tambahan,
            kadaluarsa: kadaluarsaBaru || barang.kadaluarsa
        };

        localStorage.setItem('stokBarang', JSON.stringify(listBarang));
        tampilkanData(); // Refresh tabel
        alert("Stok berhasil diperbarui!");
    }
}

// Input Cari
const cariInput = document.getElementById('cariInput');
if (cariInput) {
    cariInput.addEventListener('keyup', () => {
        tampilkanData(cariInput.value);
    });
}

// Jalankan saat pertama dimuat
tampilkanData();


// ==========================================
// LOGIKA KASIR
// ==========================================
let keranjang = [];
const productInput = document.getElementById('productInput');
const btnAddKasir = document.getElementById('addBtn');
const cartBody = document.getElementById('cartBody');
const grandTotalEl = document.getElementById('grandTotal');

function updateDatalist() {
    const suggestions = document.getElementById('productSuggestions');
    if (!suggestions) return;
    const listBarang = JSON.parse(localStorage.getItem('stokBarang')) || [];
    suggestions.innerHTML = "";
    listBarang.forEach(item => {
        let option = document.createElement('option');
        option.value = item.nama;
        suggestions.appendChild(option);
    });
}

if (btnAddKasir) {
    updateDatalist();

    btnAddKasir.onclick = function() {
        const namaCari = productInput.value;
        const qty = parseInt(document.getElementById('qtyInput').value);
        const listBarang = JSON.parse(localStorage.getItem('stokBarang')) || [];

        const produk = listBarang.find(item => item.nama.toLowerCase() === namaCari.toLowerCase());

        if (produk) {
            if (parseInt(produk.jumlah) < qty) return alert("Stok kurang!");

            keranjang.push({
                nama: produk.nama,
                harga: parseInt(produk.jual),
                qty: qty,
                subtotal: parseInt(produk.jual) * qty
            });
            updateKeranjang();
            productInput.value = "";
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
                <td>Rp ${item.harga.toLocaleString()}</td>
                <td>${item.qty}</td>
                <td>Rp ${item.subtotal.toLocaleString()}</td>
                <td><button onclick="hapusItemKeranjang(${index})">X</button></td>
            </tr>`;
    });
    grandTotalEl.innerText = "Rp " + total.toLocaleString();
}

window.hapusItemKeranjang = function(index) {
    keranjang.splice(index, 1);
    updateKeranjang();
};


// ==========================================
// LOGIKA BAYAR, SIMPAN LAPORAN & POTONG STOK
// ==========================================
const checkoutBtn = document.getElementById('checkoutBtn');
if (checkoutBtn) {
    checkoutBtn.onclick = function() {
        if (keranjang.length === 0) return alert("Keranjang kosong!");
        
        let listBarang = JSON.parse(localStorage.getItem('stokBarang')) || [];
        let historiPenjualan = JSON.parse(localStorage.getItem('laporanPenjualan')) || [];

        const waktu = new Date();
        const idTrx = "TRX-" + waktu.getTime();

        keranjang.forEach(itemKeranjang => {
            // 1. Simpan ke Histori Laporan
            historiPenjualan.push({
                id: idTrx,
                tanggal: waktu.toLocaleDateString('id-ID'),
                jam: waktu.toLocaleTimeString('id-ID'),
                nama: itemKeranjang.nama,
                harga: itemKeranjang.harga,
                qty: itemKeranjang.qty,
                total: itemKeranjang.subtotal
            });

            // 2. Potong Stok di Gudang
            let itemStok = listBarang.find(s => s.nama === itemKeranjang.nama);
            if (itemStok) itemStok.jumlah = parseInt(itemStok.jumlah) - itemKeranjang.qty;
        });

        localStorage.setItem('stokBarang', JSON.stringify(listBarang));
        localStorage.setItem('laporanPenjualan', JSON.stringify(historiPenjualan));

        alert("Pembayaran Berhasil & Transaksi Dicatat!");
        keranjang = [];
        updateKeranjang();
    };
}


// ==========================================
// LOGIKA PRINT STRUK & DOWNLOAD CSV
// ==========================================
const printBtn = document.getElementById('printBtn');
if (printBtn) {
    printBtn.onclick = function() {
        if (keranjang.length === 0) return alert("Keranjang masih kosong!");

        const receiptContent = document.getElementById('receiptContent');
        const receiptTotal = document.getElementById('receiptTotal');
        
        receiptContent.innerHTML = "";
        let total = 0;
        keranjang.forEach(item => {
            total += item.subtotal;
            receiptContent.innerHTML += `
                <tr>
                    <td>${item.nama}</td>
                    <td style="text-align: center;">${item.qty}</td>
                    <td style="text-align: right;">${item.subtotal.toLocaleString()}</td>
                </tr>`;
        });
        receiptTotal.innerText = "Total: Rp " + total.toLocaleString();

        window.print();
    };
}

const downloadKasirCsvBtn = document.getElementById('downloadKasirCsvBtn');
if (downloadKasirCsvBtn) {
    downloadKasirCsvBtn.onclick = function() {
        let histori = JSON.parse(localStorage.getItem('laporanPenjualan')) || [];
        if (histori.length === 0) return alert("Belum ada data transaksi!");

        let csvContent = "ID Transaksi,Tanggal,Jam,Produk,Harga Satuan,Qty,Total\n";

        histori.forEach(trx => {
            csvContent += `${trx.id},${trx.tanggal},${trx.jam},${trx.nama},${trx.harga},${trx.qty},${trx.total}\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Laporan_Penjualan_${new Date().toDateString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
}

// ==========================================
// LOGIKA DOWNLOAD CSV UNTUK STOK
// ==========================================
const stockCsvBtn = document.getElementById('stockCsv');

if (stockCsvBtn) {
    stockCsvBtn.onclick = function() {
        // 1. Ambil data stok dari localStorage
        let listBarang = JSON.parse(localStorage.getItem('stokBarang')) || [];
        
        if (listBarang.length === 0) {
            return alert("Data stok kosong, tidak ada yang bisa di-download!");
        }

        // 2. Buat Header CSV
        let csvContent = "No,Nama Barang,Jumlah,Jenis,Harga Beli,Harga Jual,Kadaluarsa,Tanggal Masuk\n";

        // 3. Isi data ke dalam format CSV
        listBarang.forEach((item, index) => {
            let row = [
                index + 1,
                item.nama,
                item.jumlah,
                item.jenis,
                item.beli,
                item.jual,
                item.kadaluarsa,
                item.tanggal
            ].join(","); // Menggabungkan kolom dengan koma
            
            csvContent += row + "\n";
        });

        // 4. Proses Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        
        link.setAttribute("href", url);
        link.setAttribute("download", `Data_Stok_Barang_${new Date().toLocaleDateString('id-ID')}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
}


// ==========================================
// LOGIKA MANAJEMEN LAPORAN PENJUALAN
// ==========================================
const tableBodyPenjualan = document.getElementById('tableBodyPenjualan');

function tampilkanLaporan() {
    if (!tableBodyPenjualan) return;
    
    let histori = JSON.parse(localStorage.getItem('laporanPenjualan')) || [];
    tableBodyPenjualan.innerHTML = "";

    histori.forEach((trx, index) => {
        let row = `<tr>
            <td>${trx.id}</td>
            <td>${trx.tanggal} <br> <small>${trx.jam}</small></td>
            <td>${trx.nama}</td>
            <td>${trx.qty}</td>
            <td>Rp ${trx.total.toLocaleString('id-ID')}</td>
            <td>
                <button class="editBtn" onclick="editPenjualan(${index})">Edit Qty</button>
                <button class="dltBtn" onclick="hapusPenjualan(${index})">Hapus</button>
            </td>
        </tr>`;
        tableBodyPenjualan.innerHTML += row;
    });
}

// Fungsi Hapus Data Penjualan
window.hapusPenjualan = function(index) {
    if (confirm("Hapus riwayat transaksi ini? (Ini tidak akan mengembalikan stok)")) {
        let histori = JSON.parse(localStorage.getItem('laporanPenjualan')) || [];
        histori.splice(index, 1);
        localStorage.setItem('laporanPenjualan', JSON.stringify(histori));
        tampilkanLaporan();
    }
}

// Fungsi Edit Qty Penjualan
window.editPenjualan = function(index) {
    let histori = JSON.parse(localStorage.getItem('laporanPenjualan')) || [];
    let trx = histori[index];

    let qtyBaru = prompt(`Ubah jumlah beli untuk ${trx.nama}:`, trx.qty);
    
    if (qtyBaru !== null && qtyBaru > 0) {
        // Hitung ulang total harga berdasarkan harga satuan asli
        let hargaSatuan = trx.total / trx.qty;
        trx.qty = parseInt(qtyBaru);
        trx.total = hargaSatuan * trx.qty;

        histori[index] = trx;
        localStorage.setItem('laporanPenjualan', JSON.stringify(histori));
        tampilkanLaporan();
    }
}

// Jalankan saat halaman dibuka
tampilkanLaporan();

// ==========================================
// REVISI FUNGSI EDIT QTY PENJUALAN (DENGAN UPDATE STOK)
// ==========================================
window.editPenjualan = function(index) {
    let histori = JSON.parse(localStorage.getItem('laporanPenjualan')) || [];
    let listBarang = JSON.parse(localStorage.getItem('stokBarang')) || [];
    let trx = histori[index];

    // Cari produk di stok berdasarkan nama
    let itemStok = listBarang.find(s => s.nama === trx.nama);

    if (!itemStok) {
        alert("Produk asli tidak ditemukan di stok, hanya data laporan yang akan berubah.");
    }

    let qtyBaru = prompt(`Ubah jumlah beli untuk ${trx.nama}:`, trx.qty);
    
    if (qtyBaru !== null && qtyBaru !== "") {
        let nQtyBaru = parseInt(qtyBaru);
        let nQtyLama = parseInt(trx.qty);

        if (isNaN(nQtyBaru) || nQtyBaru < 0) return alert("Masukkan jumlah yang valid!");

        // LOGIKA UPDATE STOK:
        if (itemStok) {
            // 1. Kembalikan stok lama ke gudang
            let stokSekarang = parseInt(itemStok.jumlah) + nQtyLama;

            // 2. Cek apakah stok cukup untuk jumlah baru
            if (stokSekarang < nQtyBaru) {
                return alert("Gagal! Stok di gudang tidak mencukupi untuk perubahan ini.");
            }

            // 3. Update stok dengan pengurangan baru
            itemStok.jumlah = stokSekarang - nQtyBaru;
        }

        // 4. Update data transaksi di laporan
        let hargaSatuan = trx.total / nQtyLama;
        trx.qty = nQtyBaru;
        trx.total = hargaSatuan * nQtyBaru;

        // 5. Simpan semua ke LocalStorage
        histori[index] = trx;
        localStorage.setItem('laporanPenjualan', JSON.stringify(histori));
        localStorage.setItem('stokBarang', JSON.stringify(listBarang));

        // 6. Refresh tampilan
        alert("Berhasil memperbarui laporan dan stok!");
        tampilkanLaporan();
    }
}

window.hapusPenjualan = function(index) {
    if (confirm("Hapus riwayat transaksi ini? Stok barang akan dikembalikan ke gudang.")) {
        let histori = JSON.parse(localStorage.getItem('laporanPenjualan')) || [];
        let listBarang = JSON.parse(localStorage.getItem('stokBarang')) || [];
        let trx = histori[index];

        // Kembalikan stok
        let itemStok = listBarang.find(s => s.nama === trx.nama);
        if (itemStok) {
            itemStok.jumlah = parseInt(itemStok.jumlah) + parseInt(trx.qty);
        }

        // Hapus dari laporan
        histori.splice(index, 1);

        // Simpan
        localStorage.setItem('laporanPenjualan', JSON.stringify(histori));
        localStorage.setItem('stokBarang', JSON.stringify(listBarang));
        
        tampilkanLaporan();
    }
}