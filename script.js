const layar_input = document.querySelector(".input");
const layar_output = document.querySelector(".output");
const btn = document.querySelectorAll(".key");
const historyContent = document.querySelector(".history-content");
const clearHistoryBtn = document.getElementById("clear-history");

let rawInput = "";
let displayInput = "";

// memformat angka ke format ribuan
const formatThousands = (number) => {
  const numberString = number.toString();
  if (numberString.includes(".")) {
    const [integerPart, decimalPart] = numberString.split(".");
    return `${integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${decimalPart}`;
  }
  return numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const removeThousandsFormat = (input) => {
  return input.replace(/\./g, "").replace(",", ".");
};

const validateDecimalInput = (input, newValue) => {
  const lastNumberMatch = input.match(/(\d+(\.\d*)?)$/);
  if (!lastNumberMatch && newValue === ".") { 
    return input + "0."; 
  }
  if (lastNumberMatch && lastNumberMatch[0].includes(".") && newValue === ".") {
    return input; 
  }
  return input + newValue;
};

const updateDisplayInput = () => {
  displayInput = rawInput
    .replace(/\*/g, "×") 
    .replace(/(\d+(\.\d*)?)/g, (match) => formatThousands(match));
  layar_input.innerHTML = displayInput;
};

clearHistoryBtn.addEventListener("click", () => {
  historyContent.innerHTML = "";
});

const prepareCalculationInput = (input) => {
  return input.replace(/×/g, "*");
};

for (let key of btn) {
  const value = key.dataset.key;

  key.addEventListener("click", () => {
    if (value === "hapus") {
      rawInput = "";
      displayInput = "";
      layar_input.innerHTML = "";
      layar_output.innerHTML = "";
    } else if (value === "backspace") {
      rawInput = rawInput.slice(0, -1);
      updateDisplayInput();
    } else if (value === "=") {
      try {
        let preparedInput = prepareCalculationInput(rawInput);
    
        // Validasi operasi nol dibagi atau pembagian dengan nol
        if (/^0\/[1-9]/.test(preparedInput)) {
          throw new Error("Operasi tidak valid: 0 dibagi dengan angka.");
        }
        if (/\/0(?!\d)/.test(preparedInput)) {
          throw new Error("Operasi tidak valid: pembagian dengan nol.");
        }
    
        let result = eval(preparedInput);
    
        if (result % 1 !== 0) {
          result = parseFloat(result.toFixed(10)); 
        }
    
        layar_output.innerHTML = formatThousands(result); 
    
        const historyEntry = document.createElement("div");
        historyEntry.classList.add("history-entry");
        historyEntry.textContent = `${displayInput} = ${formatThousands(result)}`;
        historyContent.prepend(historyEntry);
      } catch (error) {
        layar_output.innerHTML = "Error";
        alert(error.message); // Menampilkan pesan error 
      }
    }
     else if (value === "brackest") {
      let openCount = (rawInput.match(/\(/g) || []).length;
      let closeCount = (rawInput.match(/\)/g) || []).length;

      if (openCount <= closeCount) {
        rawInput += "(";
      } else {
        rawInput += ")";
      }

      updateDisplayInput();
    } else if (value === ".") {
      rawInput = validateDecimalInput(rawInput, ".");
      updateDisplayInput();
    } else if (value === "-" && rawInput.length === 0) {
      rawInput += "-";
      updateDisplayInput();
    } else if (value === "-" && /[+\-*/(]$/.test(rawInput)) { 
      if (!rawInput.endsWith("-")) {
        rawInput += "-";
        updateDisplayInput();
      }
    } else if (["+", "*", "/", "%"].includes(value)) {
      if (value === "%") {
        const lastNumberMatch = rawInput.match(/(\d+(\.\d*)?)$/);
        if (lastNumberMatch) {
          const percentage = parseFloat(lastNumberMatch[0]) / 100; 
          rawInput = rawInput.replace(/(\d+(\.\d*)?)$/, percentage.toString());
          updateDisplayInput();
        }
      } else if (rawInput.length > 0 && !/[+\-*/(]$/.test(rawInput)) {
        rawInput += value;
        updateDisplayInput();
      }
    } else {
      rawInput += value;
      updateDisplayInput();
    }
  });
}


function toggleDropdown() {
  document.getElementById("dropdownContent").classList.toggle("show");
}

// Menutup dropdown jika klik di luar
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {
      let dropdowns = document.getElementsByClassName("dropdown-content");
      for (let i = 0; i < dropdowns.length; i++) {
          let openDropdown = dropdowns[i];
          if (openDropdown.classList.contains('show')) {
              openDropdown.classList.remove('show');
          }
      }
  }
}