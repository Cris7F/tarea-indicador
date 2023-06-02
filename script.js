var indicadoresSelector = document.getElementById('indicadores');
var indicadorInfoContainer = document.getElementById('indicador-info');
var indicadorChart = document.getElementById('indicador-chart').getContext('2d');
var indicadorTable = document.getElementById('indicador-table').getElementsByTagName('tbody')[0];
var apiUrl = 'https://mindicador.cl/api';
var chart;

function actualizarGrafico(indicador) {
  axios.get(apiUrl + '/' + indicador)
    .then(function (response) {
      var indicador = response.data;
      var indicadorInfoHTML = '';
      indicadorInfoHTML += '<h2>' + indicador.nombre + '</h2>';
      indicadorInfoHTML += '<p><strong>Unidad de medida:</strong> ' + indicador.unidad_medida + '</p>';
      indicadorInfoHTML += '<p><strong>Valor:</strong> ' + indicador.serie[0].valor + '</p>';
      indicadorInfoContainer.innerHTML = indicadorInfoHTML;

      indicador.serie.sort(function(a, b) {
        return moment(a.fecha).valueOf() - moment(b.fecha).valueOf();
      });

      var fechasFormateadas = indicador.serie.map(function(data) {
        return moment(data.fecha).format('DD/MM/YYYY');
      });

      chart.data.labels = fechasFormateadas;
      chart.data.datasets[0].data = indicador.serie.map(function(data) {
        return data.valor;
      });
      chart.update();
    });
}

function actualizarTabla(indicador) {
  axios.get(apiUrl + '/' + indicador)
    .then(function (response) {
      var indicador = response.data;
      indicadorTable.innerHTML = '';

      indicador.serie.forEach(function (data) {
        var fecha = moment(data.fecha).format('DD/MM/YYYY');
        var valor = data.valor;

        var row = indicadorTable.insertRow();

        var fechaCell = row.insertCell(0);
        var valorCell = row.insertCell(1);

        fechaCell.innerHTML = fecha;
        valorCell.innerHTML = valor;
      });
    });
}
indicadoresSelector.addEventListener('change', function () {
  var indicadorSeleccionado = indicadoresSelector.value;
  if (indicadorSeleccionado !== '') {
    actualizarGrafico(indicadorSeleccionado);
    actualizarTabla(indicadorSeleccionado);
  }
});

axios.get(apiUrl)
  .then(function (response) {
    var indicadores = response.data;
    for (var key in indicadores) {
      if (indicadores[key].nombre !== undefined) {
        var option = document.createElement('option');
        option.value = key;
        option.text = indicadores[key].nombre;
        indicadoresSelector.appendChild(option);
      }
    }
    var primerIndicador = Object.keys(indicadores)[0];
    actualizarGrafico(primerIndicador);
    actualizarTabla(primerIndicador);
  })
  .catch(function (error) {
    console.log(error);
  });

chart = new Chart(indicadorChart, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Valores',
      data: [],
      backgroundColor: 'blue',
      borderColor: 'black',
      borderWidth: 1
    }]
  },
  options: {
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Fecha',
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10 
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Valor',
        }
      },
    }
  }
});

