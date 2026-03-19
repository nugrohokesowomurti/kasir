//ambil elemen dari html
const addButton = document.querySelector('.addButton');
const tableBody = document.getElementById('tableBody');
    
//fungsi saat tombol tambah barang diklik
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
            jenis: jenis, // Tadi 'jenis' belum dimasukkan ke objek kan?
            beli: hargaBeli,
            jual: hargaJual,
            kadaluarsa: kadaluarsa,
            tanggal: new Date().toDateString()
        };

        // simpan ke local storage
        saveToLocal(barangBaru);

        // update tampilan table
        tampilkanData();
    }
};

function saveToLocal(item){
    let listBarang = JSON.parse(localStorage.getItem('stokBarang')) || [];
    listBarang.push(item);
    localStorage.setItem('stokBarang',JSON.stringify(listBarang));
}

function tampilkanData(filterText = ""){
    let listBarang = JSON.parse(localStorage.getItem('stokBarang')) || [];
    tableBody.innerHTML = ""; //bersihkan table dulu

    listBarang.forEach((item, index) =>{
        // Logika Pencarian: Cek apakah nama barang mengandung teks pencarian
        if (item.nama.toLowerCase().includes(filterText.toLowerCase())) {

    //ubah harga ke rupiah
    // 1. Ubah teks harga menjadi angka, lalu format ke Rupiah
        let hargaBeliFmt = "RP " + Number(item.beli).toLocaleString('id-ID');
        let hargaJualFmt = "RP " + Number(item.jual).toLocaleString('id-ID');

        let row = 
            
            `<tr>
                <td>${index + 1}</td>
                <td>${item.nama}</td>
                <td>${item.jumlah}</td>
                <td>${item.jenis}</td>
                <td>${hargaBeliFmt}</td> <td>${hargaJualFmt}</td> <td>${item.kadaluarsa}</td>
                <td>${item.tanggal}</td>
                <td>
                    <button class="editBtn" onclick="mulaiEdit(${index})">Edit</button>
                    <button class= "dltBtn" onclick="hapusBarang(${index})">Hapus</button>
                </td>
            </tr>`;
            tableBody.innerHTML += row;
        }
    });
}

function mulaiEdit(index) {
    // 1. Ambil dari local storage (Pastikan namanya 'stokBarang')
    let listBarang = JSON.parse(localStorage.getItem('stokBarang')) || [];
    let barang = listBarang[index];

    // 2. Munculkan prompt (Gunakan barang.property)
    let namaBaru = prompt("Ubah nama barang: ", barang.nama);
    let jumlahBaru = prompt("Ubah jumlah barang: ", barang.jumlah);
    let jenisBaru = prompt("Ubah jenis Barang:", barang.jenis);
    let beliBaru = prompt("Ubah harga Beli:", barang.beli);
    let jualBaru = prompt("Ubah harga Jual:", barang.jual); // Tambahkan ini jika ada
    let kadaluarsaBaru = prompt("Ubah tanggal kadaluarsa:", barang.kadaluarsa);
    let tanggalBaru = prompt("Ubah tanggal masuk barang:", barang.tanggal);

    // 3. Simpan jika data minimal (nama & jumlah) diisi
    if (namaBaru && jumlahBaru) {
        listBarang[index] = {
            nama: namaBaru,
            jumlah: jumlahBaru,
            jenis: jenisBaru,
            beli: beliBaru,
            jual: jualBaru,
            kadaluarsa: kadaluarsaBaru,
            tanggal: tanggalBaru
        };

        // 4. Simpan kembali (Gunakan 'stokBarang')
        localStorage.setItem('stokBarang', JSON.stringify(listBarang));

        // 5. Refresh tampilan
        tampilkanData();
    }
}

// Tambahkan juga fungsi hapus agar tombol hapus berfungsi
function hapusBarang(index) {
    if (confirm("Apakah anda yakin ingin menghapus barang ini?")) {
        let listBarang = JSON.parse(localStorage.getItem('stokBarang')) || [];
        listBarang.splice(index, 1);
        localStorage.setItem('stokBarang', JSON.stringify(listBarang));
        tampilkanData();
    }
}

const cariInput = document.getElementById('cariInput');

cariInput.addEventListener('keyup', function() {
    const kataKunci = cariInput.value;
    tampilkanData(kataKunci);
});

tampilkanData();