function drawGraph() {
    const canvas = document.getElementById('graph');

    const width = canvas.width;
    const height = canvas.height;
    const R = height / 2.5;
    centerX = width / 2;
    centerY = height / 2;

    const ctx = canvas.getContext('2d');


    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX, centerY - R);
    ctx.lineTo(centerX - R, centerY);
    ctx.lineTo(centerX - R/2, centerY);
    ctx.lineTo(centerX - R/2, centerY + R);
    ctx.lineTo(centerX, centerY + R);
    ctx.lineTo(centerX, centerY);
    ctx.lineTo(centerX + R, centerY);
    ctx.arc(centerX, centerY, R, 0,3 * Math.PI / 2, true);
    ctx.closePath();
    ctx.fillStyle = 'rgba(51, 155, 215, 1)';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.strokeStyle = "black";
    ctx.stroke();

    ctx.font = "12px monospace";

    ctx.strokeText("0", centerX + 6, centerY - 6);
    ctx.strokeText("R/2", centerX + R / 2 - 6, centerY - 6);
    ctx.strokeText("R", centerX + R - 6, centerY - 6);

    ctx.strokeText("-R/2", centerX - R / 2 - 18, centerY - 6);
    ctx.strokeText("-R", centerX - R - 6, centerY - 6);

    ctx.strokeText("R/2", centerX + 6, centerY - R / 2 + 6);
    ctx.strokeText("R", centerX + 6, centerY - R + 6);

    ctx.strokeText("-R/2", centerX + 6, centerY + R / 2 + 6);
    ctx.strokeText("-R", centerX + 6, centerY + R + 6);
}

function isEmpty(x, y, r) {
  //msg.textContent = "Ошибка: все поля должны быть заполнены";
  let s = "";
  if (x === null) {
      s += "X ";
  }
  if (y === "") {
      s += "Y ";
  }
  if (r === null) {
      s += "R ";
  }
  if (s !== "") {
      msg.textContent = "Ошибка: необходимо заполнить " + s;
      return true;
  }
  return false;
}

function validateY(y) {
    if (y === "") {
        return "Ошибка: Y не должно быть пустым";
    }
    const numericRe = /^-?\d+(?:[.,]\d+)?$/;
    if (!numericRe.test(y)) {
        return "Ошибка: Y должно быть числом";
    }
    let numY = Number(y.replace(",", "."));
    if (numY < -5 || numY > 5) {
        return "Ошибка: Y должно быть в диапазоне {-5, 5}";
    }
    return "";
}

async function sendAndAccept(x, y, r) {
  const response = await fetch("/fcgi-bin/server.jar", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
        },
        body: JSON.stringify({
        x: x,
        y: y,
        r: r
        }),
        }
    );
    if (!response.ok) {
        msg.textContent = "Ошибка HTTP: " + response.status;
        return;
    }
    const result = await response.json();
    return result;
}

function addRow(json) {
  const resultTBody = document.querySelector("#result_table");
  const row = document.createElement("tr");
  row.innerHTML = `
  <td>${json.result}</td>
  <td>${json.x}</td>
  <td>${json.y}</td>
  <td>${json.r}</td>
  <td>${json.worktime + " mks"}</td>
  <td>${json.date}</td>
  `;
  resultTBody.appendChild(row);
}

function saveTable(newData) {
  const data = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]");
  data.push(newData);
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadTable() {
  const data = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]");
  data.forEach(item => addRow(item));
}

const STORAGE_KEY = "resultTable";
let x = null;
let y = null;
let r = null;
let yInput = null;

drawGraph();
loadTable();

const msg = document.getElementById("eror_message");

const xButtons = document.querySelectorAll('input[name="x"]');
xButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    xButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    x = btn.value;
    console.log('Выбран X:', x);
  });
});



document.querySelector('input[type="submit"]').addEventListener('click', async (event) => {
  event.preventDefault();

    let rawY = document.querySelector('input[name="y"]').value.trim();

    let selectedR = document.querySelector('input[name="r"]:checked');
    r = selectedR ? selectedR.value : null;

    if (isEmpty(x, rawY, r)) {
        return;
    }

    let ans = validateY(rawY);

    if (ans !== "") {
        msg.textContent = ans;
        return;
    }

    y = Number(rawY.replace(",", "."));

  console.log("X =", x);
  console.log("Y =", y);
  console.log("R =", r);

  try {
    const responseData = await sendAndAccept(x, y, r);
    if (responseData === null) {
      msg.textContent = "Ошибка: не удалось получить ответ от сервера";
      return;
    }
    addRow(responseData);
    saveTable(responseData);
    msg.textContent = "";
  
} catch (error) {
    msg.textContent = "Ошибка сети: " + error.message;
    return;
  }

});