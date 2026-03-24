// ==========================================
// LOGIKA MANAJEMEN STOK
// ==========================================
const addButton = document.querySelector('.addButton');
const tableBody = document.getElementById('tableBody');

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
                tanggal: new Date().toDateString()
            };
            saveToLocal(barangBaru);
            tampilkanData();
        }
    };
}

function saveToLocal(item){
    let listBarang = JSON.parse(localStorage.getItem('stokBarang')) || [];
    listBarang.push(item);
    localStorage.setItem('stokBarang',JSON.stringify(listBarang));
}

function tampilkanData(filterText = ""){
    if (!tableBody) return; 
    let listBarang = JSON.parse(localStorage.getItem('stokBarang')) || [];
    tableBody.innerHTML = ""; 

    listBarang.forEach((item, index) =>{
        if (item.nama.toLowerCase().includes(filterText.toLowerCase())) {
            let hargaBeliFmt = "RP " + Number(item.beli).toLocaleString('id-ID');
            let hargaJualFmt = "RP " + Number(item.jual).toLocaleString('id-ID');

            let row = `<tr>
                <td>${index + 1}</td>
                <td>${item.nama}</td>
                <td>${item.jumlah}</td>
                <td>${item.jenis}</td>
                <td>${hargaBeliFmt}</td> <td>${hargaJualFmt}</td> <td>${item.kadaluarsa}</td>
                <td>${item.tanggal}</td>
                <td>
                    <button class="editBtn" onclick="mulaiEdit(${index})">Edit</button>
                    <button class="dltBtn" onclick="hapusBarang(${index})">Hapus</button>
                </td>
            </tr>`;
            tableBody.innerHTML += row;
        }
    });
}

function mulaiEdit(index) {
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
            nama: namaBaru, jumlah: jumlahBaru, jenis: jenisBaru,
            beli: beliBaru, jual: jualBaru, kadaluarsa: kadaluarsaBaru,
            tanggal: new Date().toDateString()
        };
        localStorage.setItem('stokBarang', JSON.stringify(listBarang));
        tampilkanData();
    }
}

function hapusBarang(index) {
    if (confirm("Apakah anda yakin ingin menghapus barang ini?")) {
        let listBarang = JSON.parse(localStorage.getItem('stokBarang')) || [];
        listBarang.splice(index, 1);
        localStorage.setItem('stokBarang', JSON.stringify(listBarang));
        tampilkanData();
    }
}

const cariInput = document.getElementById('cariInput');
if (cariInput) {
    cariInput.addEventListener('keyup', function() {
        tampilkanData(cariInput.value);
    });
}

// Jalankan fungsi tampilkan data stok saat pertama kali dimuat
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

const downloadCsvBtn = document.getElementById('downloadCsvBtn');
if (downloadCsvBtn) {
    downloadCsvBtn.onclick = function() {
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
