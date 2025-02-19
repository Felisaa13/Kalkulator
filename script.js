const layar_input = document.querySelector(".input");
const layar_output = document.querySelector(".output");
const btn = document.querySelectorAll(".key");
const historyContent = document.querySelector(".history-content");
const clearHistoryBtn = document.getElementById("clear-history");

let rawInput = "";
let displayInput = "";

// Fungsi untuk memformat angka dengan pemisah ribuan
const formatThousands = (number) => {
  const numberString = number.toString();
  if (numberString.includes(".")) {
    const [integerPart, decimalPart] = numberString.split(".");
    return `${integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${decimalPart}`;
  }
  return numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

// Fungsi untuk menghapus format ribuan agar bisa dihitung
const removeThousandsFormat = (input) => {
  return input.replace(/\./g, "").replace(",", ".");
};

// Fungsi untuk validasi input desimal
const validateDecimalInput = (input, newValue) => {
  const lastNumberMatch = input.match(/(\d+(\.\d*)?)$/);
  if (!lastNumberMatch && newValue === ".") { 
    return input + "0."; 
  }
  if (lastNumberMatch && lastNumberMatch[0].includes(".")) {
    return input; 
  }
  return input + newValue;
};

// Fungsi untuk memperbarui tampilan input
const updateDisplayInput = () => {
  displayInput = rawInput
    .replace(/\*/g, "×") // Mengganti simbol perkalian
    .replace(/(\d+(\.\d*)?)/g, (match) => formatThousands(match));
  layar_input.innerHTML = displayInput;
};

// Menghapus riwayat perhitungan
clearHistoryBtn.addEventListener("click", () => {
  historyContent.innerHTML = "";
});

// Fungsi untuk menyiapkan input perhitungan
const prepareCalculationInput = (input) => {
  return input.replace(/×/g, "*"); // Mengubah simbol × menjadi * untuk perhitungan
};

// Fungsi untuk mencegah operator berulang
const filterOperatorInput = (input, newOperator) => {
  if (input.length === 0 && newOperator !== "-") {
    return input; 
  }
  if (/[+\-×/]$/.test(input)) {
    return input.slice(0, -1) + newOperator; 
  }
  return input + newOperator;
};

// Event listener untuk setiap tombol kalkulator
for (let key of btn) {
  const value = key.dataset.key;

  key.addEventListener("click", () => {
    if (value === "hapus") {
      // Menghapus semua input dan output
      rawInput = "";
      displayInput = "";
      layar_input.innerHTML = "";
      layar_output.innerHTML = "";
    } else if (value === "backspace") {
      // Menghapus satu karakter terakhir
      rawInput = rawInput.slice(0, -1);
      updateDisplayInput();
    } else if (value === "=") {
      // Operasi perhitungan
      try {
        let preparedInput = prepareCalculationInput(rawInput);
        
        // Validasi pembagian dengan nol
        if (/^0\/[1-9]/.test(preparedInput)) {
          throw new Error("Operasi tidak valid: 0 dibagi dengan angka.");
        }
        if (/\/0(?!\d)/.test(preparedInput)) {
          throw new Error("Operasi tidak valid: pembagian dengan nol.");
        }
        
        let result = eval(preparedInput); // Menghitung hasil
        
        if (result % 1 !== 0) {
          result = parseFloat(result.toFixed(10)); // Membatasi angka desimal
        }
        
        layar_output.innerHTML = formatThousands(result); 
        
        // Menyimpan ke riwayat
        const historyEntry = document.createElement("div");
        historyEntry.classList.add("history-entry");
        historyEntry.textContent = `${displayInput} = ${formatThousands(result)}`;
        historyContent.prepend(historyEntry);
      } catch (error) {
        layar_output.innerHTML = "Error";
        alert(error.message);
      }
    } else if (value === "brackest") {
      // Menambah atau menutup tanda kurung
      let openCount = (rawInput.match(/\(/g) || []).length;
      let closeCount = (rawInput.match(/\)/g) || []).length;

      if (openCount <= closeCount) {
        rawInput += "(";
      } else {
        rawInput += ")";
      }

      updateDisplayInput();
    } else if (value === ".") {
      // Menangani input titik desimal
      rawInput = validateDecimalInput(rawInput, ".");
      updateDisplayInput();
    } else if (value === "-" && rawInput.length === 0) {
      // Menangani angka negatif di awal
      rawInput += "-";
      updateDisplayInput();
    } else if (["+", "×", "/", "-"].includes(value)) {
      // Operasi penjumlahan, pengurangan, perkalian, dan pembagian
      if (/[+\-×/]$/.test(rawInput)) {
        return; // Mencegah operator berulang dua kali berturut-turut
      }
      rawInput = filterOperatorInput(rawInput, value); 
      updateDisplayInput();
    } else if (value === "%") {
      // Operasi persen
      const lastNumberMatch = rawInput.match(/(\d+(\.\d*)?)$/);
      if (lastNumberMatch) {
        const percentage = parseFloat(lastNumberMatch[0]) / 100; 
        rawInput = rawInput.replace(/(\d+(\.\d*)?)$/, percentage.toString());
        updateDisplayInput();
      }
    } else {
      // Input angka
      rawInput += value;
      updateDisplayInput();
    }
  });
}  