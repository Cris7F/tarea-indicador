var indicadoresSelector = document.getElementById('indicadores');
var aniosSelector = document.getElementById('anios'); 
var fechaInput = document.getElementById("fecha"); 
var buscarButton = document.getElementById('buscar'); 
var indicadorInfoContainer = document.getElementById('indicador-info');
var indicadorChart = document.getElementById('indicador-chart').getContext('2d');
var indicadorTable = document.getElementById('indicador-table').getElementsByTagName('tbody')[0];
var apiUrl = 'https://mindicador.cl/api';
var chart;

function actualizarGrafico(indicador, anio) {
 axios.get(apiUrl + '/' + indicador + '/' + anio)
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

function actualizarTabla(indicador, anio) {
 axios.get(apiUrl + '/' + indicador + '/' + anio) 
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
buscarButton.addEventListener('click', function () {
 var indicadorSeleccionado = indicadoresSelector.value;
 var fechaSeleccionada = fechaInput.value;
 
 if (indicadorSeleccionado !== '' && fechaSeleccionada !== '') {
  var fechaFormateada = moment(fechaSeleccionada).format('DD-MM-YYYY');
  var apiUrlFecha = apiUrl + '/' + indicadorSeleccionado + '/' + fechaFormateada;

axios.get(apiUrlFecha)
.then(function (response) {
  if (response.data.serie) {
    var valorIndicador = response.data.serie[0].valor;
    var nombreIndicador = response.data.nombre;
    var fechaSeleccionada = fechaInput.value;

    indicadorInfoContainer.innerHTML = '<p><strong>Nombre:</strong> ' + nombreIndicador + '</p><p><strong>$:</strong> ' + valorIndicador + '</p><p><strong>Fecha:</strong> ' + fechaSeleccionada + '</p>';
  } else {
    indicadorInfoContainer.innerHTML = '<p><strong>No hay datos para el indicador y la fecha seleccionados.</strong></p>';
  }
})
.catch(function (error) {
  console.log(error);
});
}
});
buscarButton.addEventListener('click', function () {
 var indicadorSeleccionado = indicadoresSelector.value;
 var anioSeleccionado = aniosSelector.value;
 if (indicadorSeleccionado !== '' && anioSeleccionado !== '') {
 actualizarGrafico(indicadorSeleccionado, anioSeleccionado);
 actualizarTabla(indicadorSeleccionado, anioSeleccionado);
 }
});
fechaInput.addEventListener("change", function() {
 var fechaSeleccionada = fechaInput.value;
 aniosSelector.disabled = fechaSeleccionada !== "";
});
aniosSelector.addEventListener("change", function() {
 var anioSeleccionado = aniosSelector.value;
 fechaInput.disabled = anioSeleccionado !== "";
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
 actualizarGrafico(primerIndicador, '2021'); 
 actualizarTabla(primerIndicador, '2021');
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
 },
 y: {
 display: true,
 title: {
 display: true,
 text: 'Valor',
 }
 }
 }
 }
 }
});