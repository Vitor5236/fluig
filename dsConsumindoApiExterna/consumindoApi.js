/**
 * Cria um dataset baseado nos dados obtidos de uma API externa
 * @param {Array} fields Campos utilizados no dataset (não utilizado neste caso)
 * @param {Array} constraints Restrições aplicadas à consulta (não utilizado neste caso)
 * @param {Array} sortFields Campos para ordenação dos dados (não utilizado neste caso)
 * @returns {Dataset} Retorna um dataset contendo os dados processados da API
 * @author João Vitor Dourado
 */
function createDataset(fields, constraints, sortFields) {
    var dataset = DatasetBuilder.newDataset();
    var apiUrl = "URL_API"; // Defina a URL da API aqui
    var accessToken = "TOKEN_ACESSO"; // Defina seu access-token aqui

    try {
        var response = chamarAPIExterna(apiUrl, accessToken);

        if (response) {
            log.info("Resposta da API: " + response);

            var csvResponse = response.split("\n");
            var headers = csvResponse[0].split(","); // Pega os cabeçalhos da primeira linha

            // Adiciona os cabeçalhos ao dataset
            for (var i = 0; i < headers.length; i++) {
                dataset.addColumn(headers[i].trim());
            }

            // Adiciona os dados ao dataset
            for (var i = 1; i < csvResponse.length; i++) {
                var rowData = csvResponse[i].split(",");
                dataset.addRow(rowData.map(function (item) { return item.trim(); }));
            }
        } else {
            dataset.addRow(["Nenhuma resposta da API"]);
        }
    } catch (e) {
        log.error("Erro ao chamar a API: " + e.message);
        dataset.addRow(["Erro ao chamar a API", e.message]);
    }

    return dataset;
}

/**
 * Chama uma API externa para obter os dados formatados em CSV
 * @param {String} apiUrl URL da API que será acessada
 * @param {String} accessToken Token de acesso para autenticação na API
 * @returns {String} Retorna a resposta da API em formato de string CSV
 * @throws {Error} Lança um erro caso ocorra falha na requisição
 */
function chamarAPIExterna(apiUrl, accessToken) {
    var url = new java.net.URL(apiUrl);
    var connection = url.openConnection();
    connection.setRequestMethod("POST");
    connection.setRequestProperty("Content-Type", "application/json");
    connection.setRequestProperty("access-token", accessToken);

    var startDate = getCurrentDate();
    var endDate = startDate;

    // Configurar os jsonParams dinamicamente, conforme a documentação da API
    var jsonParams = 
    '{ "report": {' +
    '"start_date": "' + startDate.toString() + '",' +
    '"end_date": "' + endDate.toString() + '",' +
    '"columns": "COLUNA1,COLUNA2",' +
    '"format": "csv"' +
    '}}';

    connection.setDoOutput(true);
    var wr = new java.io.OutputStreamWriter(connection.getOutputStream());
    wr.write(jsonParams);
    wr.flush();
    wr.close();

    var response = new java.lang.StringBuilder();

    try {
        var inputStream = connection.getInputStream();
        var reader = new java.io.BufferedReader(new java.io.InputStreamReader(inputStream));
        var line;

        while ((line = reader.readLine()) != null) {
            response.append(line).append("\n");
        }

        reader.close();
    } catch (error) {
        throw new Error("Erro ao obter resposta da API: " + error.message);
    }

    return response.toString();
}

// Função auxiliar para obter a data atual no formato YYYY-MM-DD
function getCurrentDate() {
    var today = new java.util.Date();
    var sdf = new java.text.SimpleDateFormat("yyyy-MM-dd");
    return sdf.format(today);
}
