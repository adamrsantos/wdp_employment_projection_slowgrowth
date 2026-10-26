/**
 * side_by_side_bar.js
 *
 * Reads a CSV file and renders two horizontal bar charts side-by-side:
 * - left: stacked openings by industry
 * - right: median wage by industry
 */

function parseCsvLine(line) {
  const fields = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      fields.push(field);
      field = "";
    } else {
      field += ch;
    }
  }

  fields.push(field);
  return fields;
}

function parseCsv(csvText) {
  const rows = csvText
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .filter(Boolean)
    .map((line) => {
      const cols = parseCsvLine(line);
      return {
        industry: (cols[0] || "").trim(),
        replacement_openings: parseFloat(cols[1]),
        new_openings: parseFloat(cols[2]),
        pct_label: (cols[3] || "").trim(),
        median_wage: parseFloat(cols[4]),
      };
    })
    .filter(
      (row) =>
        row.industry &&
        !Number.isNaN(row.replacement_openings) &&
        !Number.isNaN(row.new_openings) &&
        !Number.isNaN(row.median_wage)
    );

  return rows;
}

function initChart(csvText, leftContainerId = "left-chart", rightContainerId = "right-chart") {
  const data = parseCsv(csvText);
  const categories = data.map((row) => row.industry);
  const labels = data.map((row) => row['pct_label']);
  const wages = data.map((row) => row['median_wage']);
  Highcharts.chart(leftContainerId, {
    chart: {
      type: "bar",
      height: 500,
    },
    title: {
      text: "Projected Openings",
    },
    xAxis: {
      title: {
        text: "Industry",
      },
      labels: {
        formatter() {
          return categories[this.value] || this.value;
        },
      },
    },
    yAxis: {
      type: "linear",
      title: {
        text: null,
      },
      labels: {
        style: {
          fontSize: "11px",
        },
      },
      reversed: false,
    },
    legend: {
      enabled: true,
    },
    plotOptions: {
      bar: {
        stacking: "normal",
        dataLabels: {
          enabled: false,
          
        },
      },
    },
    tooltip: {
      shared: false,
      formatter() {
        const categoryName = categories[this.key];
        return `<b>${this.series.name}</b><br><b>${categoryName}: </b>`+Highcharts.numberFormat(this.y, 0, '.', ',');
      },
    },
    series: [
      {
        name: "New openings",
        color: "#ffbe46",
        data: data.map((row) => row.new_openings),
        dataLabels: {
          enabled: true,
          align: 'left',
          formatter: function() {
            const label = labels[this.key];
            return '<b>' + label + '%</b>';
          }
        }
      },
      {
        name: "Replacement openings",
        color: "#3f5bbf",
        data: data.map((row) => row.replacement_openings),
      },
    ],
    credits: { enabled: false },
  });

  Highcharts.chart(rightContainerId, {
    chart: {
      type: "bar",
      height: 500,
    },
    title: {
      text: "Median Wage",
    },
    xAxis: {
      title: {
        text: null,
      },
      labels: {
        enabled: false,
      },
      min: 0,
    },
    yAxis: {
      type: "linear",
      title: {
        text: null,
      },
      labels: {
        style: {
          fontSize: "11px",
        },
      },
      reversed: false,
    },
    legend: {
      enabled: true,
    },
    plotOptions: {
      bar: {
        dataLabels: {
          enabled: false,
        },
      },
    },
    tooltip: {
      formatter() {
        const categoryName = categories[this.key];
        return `<b>${this.series.name}</b><br><b>${categoryName}: </b> $`+Highcharts.numberFormat(this.y, 0, '.', ',');
      },
    },
    series: [
      {
        name: "Median Wage",
        color: "#b371c1",
        data: data.map((row) => row.median_wage),
        dataLabels: {
          enabled: true,
          align: 'center',
          inside: true,
          color: '#fff',
          formatter: function() {
            const wage = wages[this.key];
            return '<b>$' + wage + '</b>';
          }
        }
      },
    ],
    credits: { enabled: false },
  });
}

