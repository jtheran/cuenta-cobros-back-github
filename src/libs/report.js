const fs = require('fs');
const path = require('path');

function getColorClass(test) {
  if (test.numFailingTests > 0) {
    return 'text-danger';
  } else if (test.numPendingTests > 0) {
    return 'text-warning';
  } else {
    return 'text-success';
  }
}

function crearPaginaHTML(resultados) {
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Resultados de pruebas</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
    <style>
      .resultado-prueba {
        padding: 10px;
        margin-bottom: 10px;
        border-radius: 5px;
      }
    </style>
  </head>
  <body>
    <div class="container mt-5">
      <h1>Resultados de pruebas</h1>
      <p>Total de pruebas: ${resultados.numTotalTests}</p>
      <p>Pruebas fallidas: ${resultados.numFailedTests}</p>
      <div class="row">
        <div class="col-md-6">
          <h2>Información detallada</h2>
          <ul>
            <li>Número total de pruebas: ${resultados.testResults[0].numTotalTests}</li>
            <li>Número de pruebas fallidas: ${resultados.testResults[0].numFailedTests}</li>
            <li>Número de pruebas pasadas: ${resultados.testResults[0].numPassingTests}</li>
            <li>Número de pruebas pendientes: ${resultados.testResults[0].numPendingTests}</li>
          </ul>
        </div>
      </div>
      <h2>Detalles de las pruebas</h2>
      ${resultados.testResults[0].testResults.map(test => `
        <div class="resultado-prueba ${getColorClass(test)}">
          <p>${test.title}</p>
          <p>${test.status}</p>
        </div>
      `).join('')}
    </div>
  </body>
  </html>
  `;

  const carpetaSalida = path.join(__dirname, '../report');
  const archivoSalida = path.join(carpetaSalida, 'reporter.html');

  if (!fs.existsSync(carpetaSalida)) {
    fs.mkdirSync(carpetaSalida);
  }

  fs.writeFileSync(archivoSalida, html);

  console.log('Página HTML generada exitosamente en:', archivoSalida);
}


module.exports = crearPaginaHTML;
