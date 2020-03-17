function read_and_parse(url, base_link, id_attribute) {
    const app = document.getElementById('root');

    console.log(url);

    const container = document.createElement('div');
    container.setAttribute('class', 'container');

    app.appendChild(container);

    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.setRequestHeader("Content-Type", "application/json");

    request.onload = function() {

        // Begin accessing JSON data here
        var data = JSON.parse(this.response);
        var items = data['hydra:member'];

        if (request.status >= 200 && request.status < 400) {
            items.forEach(item => {
                const card = document.createElement('div');
                card.setAttribute('class', 'card');

                const p = document.createElement('p');
                console.log(item.label);
                if ( item.label === undefined ) p.textContent = item.name;
                else p.textContent = item.label;
                p.setAttribute('class', 'title');

                container.appendChild(card);
                var a = document.createElement('a');
                a.href = base_link + item[id_attribute];

                card.appendChild(a);

                a.appendChild(p);

                span = document.createElement('span');
                Object.keys(item)
                    .forEach(function eachKey(key) {
                        span.textContent = span.textContent + ' / ' + key + ': ' + item[key];
                    });
                span.classList.add ('meta')
                card.appendChild(span);

            });
        } else {
            const errorMessage = document.createElement('marquee');
            errorMessage.textContent = `Gah, it's not working!`;
            app.appendChild(errorMessage);
        }
    }

    request.send();
}

function read_and_parse_indicators(url, base_link) {
    const app = document.getElementById('root');

    console.log(url);

    const container = document.createElement('div');
    container.setAttribute('class', 'container');

    app.appendChild(container);

    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.setRequestHeader("Content-Type", "application/json");

    request.onload = function() {

        // Begin accessing JSON data here
        var data = JSON.parse(this.response);

        var items = data['hydra:member'];

        if (request.status >= 200 && request.status < 400) {
            items.forEach(item => {
                const card = document.createElement('div');
                card.setAttribute('class', 'card');
                container.appendChild(card);

                var a = document.createElement('a');
                a.href = base_link + item.id;
                var p = document.createElement('p');
                p.textContent = item.name;
                p.setAttribute('class', 'title');
                card.appendChild(a);
                a.appendChild(p);

                p = document.createElement('p');
                span = document.createElement('span');
                span.textContent = 'Source: ' + item.organization;
                p.appendChild(span);
                card.appendChild(p);

                span = document.createElement('span');
                span.textContent = 'Country: ' + item.country;
                var iso3 =  item.country.substr(item.country.length - 3);
                var a = document.createElement('a');
                a.href =  './country.html?code=' + iso3;
                a.appendChild(span);
                p.appendChild(a);

                span = document.createElement('span');
                Object.keys(item)
                    .forEach(function eachKey(key) {
                        span.textContent = span.textContent + ' / ' + key + ': ' + item[key];
                    });
                span.classList.add ('meta')
                card.appendChild(span);

                // now we call to get all the values for that indicator
                var request_values = new XMLHttpRequest();
                request_values.open('GET', 'https://api-cri-figs.tierx.dev/values?indicator.id='+item.id, true);
                request_values.setRequestHeader("Content-Type", "application/json");

                request_values.onload = function() {

                    // Begin accessing JSON data here
                     var data = JSON.parse(this.response);
                var items = data['hydra:member'];

                if (request.status >= 200 && request.status < 400) {

                     // some processing of the dataset
                     var items = items.map(function(e) {
                        e.date = new Date(e.date).toISOString().slice(0,10);
                        return e;
                    });

                     items.sort((a, b) => (a.date > b.date) ? 1 : -1);

                     var dates = items.map(a => a.date);
                     var values = items.map(a => a.value);


                     var canvas = document.createElement("canvas");
                    canvas.id = "mycanvas";
                    card.appendChild(canvas);
                    var ctx = canvas.getContext('2d');

                     //ploting the data
                     var chart = new Chart(ctx, {
                      // The type of chart we want to create
                      type: 'line',
                      // The data for our dataset
                      data: {
                          labels: dates,
                          datasets: [{
                              label: 'My First dataset',
                              backgroundColor: '#5b92e5',
                              borderColor: '#04415a',
                              data: values
                          }]
                      },

                      // Configuration options go here
                      options: {
                           borderDash:  [{
                              lineTension: 0,
                              showLine: false
                           }],
                           steppedLine: false,
                            legend: {
                                display: false
                            },
                            layout: {
                                padding: {
                                    left: 0,
                                    right: 0,
                                    top: 0,
                                    bottom: 0
                                }
                             }
                      }
                    });
                    }
            };
            request_values.send();
            });

        } else {
            const errorMessage = document.createElement('marquee');
            errorMessage.textContent = `Gah, it's not working!`;
            app.appendChild(errorMessage);
        }
    }

    request.send();
}

function read_and_parse_values(url) {
    const app = document.getElementById('root');

    console.log(url);

    const container = document.createElement('div');
    container.setAttribute('class', 'container');

    app.appendChild(container);

    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.setRequestHeader("Content-Type", "application/json");

    request.onload = function() {

        // Begin accessing JSON data here
        var data = JSON.parse(this.response);
        var items = data['hydra:member'];


        const card = document.createElement('div');
        card.setAttribute('class', 'card');

        const h1 = document.createElement('h1');
        h1.textContent = "Indicator values";
        //container.appendChild(card);

        var table = document.createElement("table");
        //card.appendChild(table);
                container.appendChild(table);

        var header = table.createTHead();
        var row = header.insertRow();
        row.insertCell().textContent ="Id Path";
        row.insertCell().textContent ="Type";
        row.insertCell().textContent ="Id";
        row.insertCell().textContent ="Date";
        row.insertCell().textContent ="Value";
        row.insertCell().textContent ="Source";

        items.sort((a, b) => (a.date < b.date) ? 1 : -1);
      var items = items.map(function(e) {
      e.date = new Date(e.date).toISOString().slice(0,10);
      return e;
    });


        if (request.status >= 200 && request.status < 400) {
            items.forEach(item => {
                row = table.insertRow();

                Object.keys(item)
                    .forEach(function eachKey(key) {
                        cell = row.insertCell();
                        cell.textContent =  item[key];
                    });

            });
        } else {
            const errorMessage = document.createElement('marquee');
            errorMessage.textContent = `Gah, it's not working!`;
            app.appendChild(errorMessage);
        }

     // some processing of the dataset
     items.sort((a, b) => (a.date > b.date) ? 1 : -1);
     var dates = items.map(a => a.date);
     var values = items.map(a => a.value);
     var ctx = document.getElementById('myChart').getContext('2d');

     //ploting the data
     var chart = new Chart(ctx, {
      // The type of chart we want to create
      type: 'line',
      // The data for our dataset
      data: {
          labels: dates,
          datasets: [{
              label: 'My First dataset',
              backgroundColor: '#5b92e5',
              borderColor: '#04415a',
              data: values
          }]
      },

      // Configuration options go here
                      options: {
                           borderDash:  [{
                              lineTension: 0,
                              showLine: false
                           }],
                           steppedLine: false,
                            legend: {
                                display: false
                            },
                            layout: {
                                padding: {
                                    left: 0,
                                    right: 0,
                                    top: 0,
                                    bottom: 0
                                }
                             }
                      }  });

        chart.canvas.parentNode.style.height = '500px';
        chart.canvas.parentNode.style.width = '1000px';

    }

    request.send();

}


