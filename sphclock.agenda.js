'use strict';

let getDows = function () {
  return ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];
};

let getDowsLongos = function () {
  return ["DOMINGO", "SEGUNDA", "TERCA", "QUARTA", "QUINTA", "SEXTA", "SABADO"];
};

let getMeses = function () {
  return [
    "JANEIRO",
    "FEVEREIRO",
    "MARCO",
    "ABRIL",
    "MAIO",
    "JUNHO",
    "JULHO",
    "AGOSTO",
    "SETEMBRO",
    "OUTUBRO",
    "NOVEMBRO",
    "DEZEMBRO",
  ];
};

exports.drawCalendar = function (date) {
  let dateStr = date.getDate();
  let dowStr = getDows()[date.getDay()];

  require("sphclock.background.js").drawBannerLeft(7, 26, 60);

  g.setFontAlign(0, 0);
  g.setFontLECO1976Regular20();
  g.setColor("#000");
  g.drawString(dateStr, 27, 25);
  g.setColor("#fff");
  g.drawString(dateStr, 25, 23);

  g.setFontLECO1976Regular14();
  g.setColor("#000");
  g.drawString(dowStr, 25, 44);

  g.setFontLECO1976Regular12();

  // Carrega a agenda pro próximo dia com eventos
  let schedules = require("Storage").readJSON("sphclock.json", false).schedule;
  // Parse da data
  schedules.forEach((s) => (s.data = new Date(s.data)));
  schedules = schedules
    .filter((v) => v.data > new Date()) // Remove eventos que já foram
    .sort((a, b) => a.data - b.data); // Ordena pela data

  if (schedules.length > 0) {
    let data = schedules[0].data;
    schedules = schedules.filter((v) => v.data.getDay() == data.getDay());

    let hoje = new Date();
    let amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);

    if (data.getDate() == hoje.getDate()) data = "HOJE";
    else if (data.getDate() == amanha.getDate()) data = "AMANHA";
    else data = getDowsLongos()[data.getDay()];

    g.setFontAlign(0, -1);
    g.setColor("#000");
    let x = 60;
    let y = 113;
    g.fillPoly(
      [
        x,
        y,
        (x -= 5),
        (y += 7),
        (x += 5),
        (y += 7),
        (x += 56),
        y,
        (x += 5),
        (y -= 7),
        (x -= 5),
        (y -= 7),
      ],
      true
    );
    g.drawLine((x -= 54), (y += 15), (x += 52), y);

    // g.setFont("Vector",10);

    g.setColor("#FFF");
    g.drawString(data, 88, 116);

    g.setFontAlign(1, -1);
    g.setColor("#000");
    let text = schedules.reduce(function (acumulador, v) {
      return (
        acumulador +
        `${v.data.getHours()}:${v.data
          .getMinutes()
          .toString()
          .padStart(2, "0")}\n`
      );
    }, "");
    g.drawString(text, 45, 136);

    g.setFontAlign(-1, -1);
    text = schedules.reduce(function (acumulador, v) {
      return acumulador + `${E.decodeUTF8(v.descricao).toUpperCase()}\n`;
    }, "");
    g.drawString(text, 50, 136);
  }
};

exports.drawCalendarFull = function (date) {
  showCalendar(date.getFullYear(), date.getMonth());
};

let showCalendar = function (year, month) {
  let today = new Date();

  let daysInMonth = 32 - new Date(year, month, 32).getDate();

  g.setColor("#000");
  g.setFontAlign(0, 0);

  let firstDay = new Date(year, month).getDay();

  // Mês
  g.fillRect(0, 0, 176, 25);
  g.setFontLECO1976Regular14();
  g.setColor("#FFF");
  g.drawString(getMeses()[month], 88, 13);
  [0, 136].forEach((v) => {
    for (let i = 5; i < 20; i += 3) {
      g.drawLine(v, i, v + 40, i);
    }
  });

  // Dias da semana
  g.setColor("#F00");
  g.fillRect(0, 25, 176, 30);
  g.setColor("#FFF");
  g.drawRect(-1, 25, 176, 30);
  g.setColor("#000");
  g.drawLine(0, 31, 176, 31);
  g.setFontLECO1976Regular14();
  for (let i = 0; i < 7; i++) {
    g.setColor("#000");
    g.drawString(getDows()[i][0], i * 25 + 11, 30);
    g.drawString(getDows()[i][0], i * 25 + 15, 30);
    g.drawString(getDows()[i][0], i * 25 + 13, 32);
    g.drawString(getDows()[i][0], i * 25 + 13, 28);
    g.setColor("#FFF");
    g.drawString(getDows()[i][0], i * 25 + 13, 30);
  }

  // Dias
  g.setColor("#000");
  g.setFontLECO1976Regular14();
  let date = 1;
  for (let i = 0; i < 6; i++) {
    //creating individual cells, filing them up with data.
    for (let j = 0; j < 7; j++) {
      if ((i > 0 || j >= firstDay) && date <= daysInMonth) {
        if (
          date == today.getDate() &&
          month == today.getMonth() &&
          year == today.getFullYear()
        ) {
          g.setColor("#F00");
          g.fillCircle(j * 25 + 13, i * 23 + 35 + 11, 12);
          g.setColor("#FFF");
        } else if (j == 0 || j == 6) g.setColor("#F00");
        else g.setColor("#000");

        g.drawString(date++, j * 25 + 13, i * 23 + 35 + 13);
      }
    }
  }
};

// check how many days in a month
