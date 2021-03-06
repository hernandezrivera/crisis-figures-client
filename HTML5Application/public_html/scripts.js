const base_figures_url = 'https://api-cri-figs.tierx.dev';
const base_country_url = 'https://restcountries.eu/rest/v2/alpha';

function get_plot_country_flag (iso3, element){

    var url = base_country_url + '/' + iso3;
    var request = new XMLHttpRequest();
    request.open('GET', url, true);

    request.onload = function() {

        // Begin accessing JSON data here
        var data = JSON.parse(this.response);

        if (request.status >= 200 && request.status < 400) {
            const img = document.createElement('img');
            img.setAttribute('src', data.flag);
            element.appendChild(img);
        } else {
            return null;
        }
    }
    request.send();
}

function get_plot_countries (endpoint, iso3){

    var countries = [];
    var country;
    
    var url = base_figures_url + endpoint;
    if (iso3 !== null)
        url += '/' + iso3;
console.log(url);
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.setRequestHeader("Content-Type", "application/json");

    request.onload = function() {

        // Begin accessing JSON data here
        var data = JSON.parse(this.response);
        if (iso3 !== null)  items = [ data ];
        else  items = data['hydra:member'];

        if (request.status >= 200 && request.status < 400) {
             console.log(items);

            items.forEach(item => {
                country = {};

                country.type = 'country';
                country.name = item.name;
                country.iso3 = item.code;
                country.link = './country.html?code=' + country.iso3;
                country.meta =  '';
                Object.keys(item)
                    .forEach(function eachKey(key) {
                        country.meta = country.meta + ' / ' + key + ': ' + item[key];
                    });
                countries.push(country);

                if (iso3 === null)
                    plot_card(country);
                else
                    plot_title(country);
            });
        } else {
            console.error ('Unable to get list of countries');
        }
    }

    request.send();
    return countries;
}

function get_plot_indicators (endpoint, iso3 , term, indicator_id){

    var indicators = [];
    var indicator;
    var url;
    if (term === null) url = base_figures_url + endpoint + '?country.code=' + iso3 + '&with[]=terms';
    if (iso3 === null) url = base_figures_url + endpoint + '?terms.name=' + term + '&with[]=terms';
    if (indicator_id !== null) url = base_figures_url + endpoint + '/' + indicator_id + '&with[]=terms';
        
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.setRequestHeader("Content-Type", "application/json");

    request.onload = function() {

        // Begin accessing JSON data here
        var data = JSON.parse(this.response);
        if (indicator_id === null)
            var items = data['hydra:member'];
        else
            var items = [data];
console.log(items);
        if (request.status >= 200 && request.status < 400) {
            items.forEach(item => {

                indicator = {};

                indicator.name = item.name;
                indicator.id = item.id;
                indicator.country = {};
                indicator.country.iso3 =  item.country.substr(item.country.length - 3);
                indicator.country.link = './country.html?code=' + indicator.country.iso3;
                
                indicator.organization = item.organization;
                indicator.link = './indicator.html?id=' + item.id;
                indicator.terms = item.terms;
            //    indicator.terms = indicator.terms.map(term => term.label);
                indicator.meta =  '';
                Object.keys(item)
                    .forEach(function eachKey(key) {
                        indicator.meta = indicator.meta + ' / ' + key + ': ' + item[key];
                    });

                indicators.push(indicator);

                if (indicator_id !== null)
                    plot_title (indicator);
                else
                    plot_card_indicator(indicator);
            });
        } else {
            console.error ('Unable to get list of indicators');
        }
    }

    request.send();
    return indicators;
}

function get_plot_values(endpoint, indicator_id, card, include_table){
    var url = base_figures_url + endpoint + '?indicator.id=' + indicator_id;

    var indicator = {};
    indicator.id = indicator_id;
    
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.setRequestHeader("Content-Type", "application/json");

    request.onload = function() {

        // Begin accessing JSON data here
        var data = JSON.parse(this.response);
        var items = data['hydra:member'];
        if (request.status >= 200 && request.status < 400) {

            var data = JSON.parse(this.response);
            var items = data['hydra:member'];

             // some processing of the dataset
             var items = items.map(function(e) {
                e.date = new Date(e.date).toISOString().slice(0,10);
                return e;
             });

             items.sort((a, b) => (a.date > b.date) ? 1 : -1);

             indicator.values_array = items;
             var indicator_dates = items.map(a => a.date);
             var indicator_values = items.map(a => a.value);
             indicator.dates = indicator_dates;
             indicator.values = indicator_values;
             plot_values(indicator, card, include_table);

        }  else {
            console.error ('Unable to get list of values');
        }
    };
    request.send();
}

function plot_values(indicator, card, include_table){

    indicator_container = card;
    var canvas = document.createElement("canvas");
    canvas.id = "mycanvas";
    var ctx = canvas.getContext('2d');

    if (indicator_container === null){
        const container = document.getElementById('container');

        indicator_container = document.createElement('div');
        indicator_container.setAttribute('class', 'indicator_canvas');
        container.appendChild(indicator_container);
        
        indicator_subcontainer = document.createElement('div');
        indicator_subcontainer.setAttribute('class', 'chart_holder');
        indicator_container.appendChild(indicator_subcontainer);

        const new_card = document.createElement('div');
        new_card.setAttribute('class', 'chart');
        indicator_subcontainer.appendChild(new_card);
        new_card.appendChild(canvas);
    } else
        indicator_container.appendChild(canvas);

     //ploting the data
     var chart = new Chart(ctx, {
      // The type of chart we want to create
      type: 'line',
      // The data for our dataset
      data: {
          labels: indicator.dates,
          datasets: [{
              label: indicator.name, // TODO: Name of the indicator
              backgroundColor: '#5b92e5',
              borderColor: '#04415a',
              data: indicator.values
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
    indicator.chart = chart;
    
    if (include_table)
        plot_values_table (indicator,indicator_container);
}

function plot_values_table (indicator, container){

    var div = document.createElement("div");
    div.setAttribute('class', 'table_data');    
    container.appendChild(div);
    
    const h3 = document.createElement('h3');
    h3.textContent = "Indicator values";
    div.appendChild(h3);

    var table = document.createElement("table");
    div.appendChild(table);

    var header = table.createTHead();
    var row = header.insertRow();
    row.insertCell().textContent ="Id Path";
    row.insertCell().textContent ="Type";
    row.insertCell().textContent ="Id";
    row.insertCell().textContent ="Date";
    row.insertCell().textContent ="Value";
    row.insertCell().textContent ="Source";

    var a;
    
    indicator.values_array.forEach(value => {
        row = table.insertRow();
        row.insertCell().textContent =  value['@id'];
        row.insertCell().textContent =  value['@type'];
        row.insertCell().textContent =  value.id;
        row.insertCell().textContent =  value.date;
        value_parsed = String(value.value).replace(/(.)(?=(\d{3})+$)/g,'$1,');
        row.insertCell().textContent =  value_parsed;
        cell = row.insertCell();
        a = document.createElement('a');
        a.href = value.sourceUrl;
        a.textContent =  value.sourceUrl;
        cell.appendChild(a);
    });
}

function plot_card_indicator(indicator){

    const container = document.getElementById('container');
        
    const card = document.createElement('div');
    card.setAttribute('class', 'card');
    container.appendChild(card);

    var a = document.createElement('a');
    a.href = indicator.link;
    card.appendChild(a);

    var p = document.createElement('p');
    p.textContent = indicator.name;
    p.setAttribute('class', 'title');
    a.appendChild(p);

    p = document.createElement('p');
    var span = document.createElement('span');
    span.textContent = 'Source: ' + indicator.organization;
    p.appendChild(span);
    card.appendChild(p);

    span = document.createElement('span');
    span.innerHTML = 'Country: <a href="' + indicator.country.link+ '">' + indicator.country.iso3;
    p.appendChild(span);
    
    span_terms = document.createElement('span');
    span_terms.setAttribute('id', 'terms');

    indicator.terms.forEach(term => {    
        var span = document.getElementById('term-'+term.name);
        if (span ===null)
        {
            span = document.createElement('span');
            span.innerHTML = '<a href="./term.html?name=' + term.name+ '">' + term.label;
            span.setAttribute('id', 'term-'+term.name);
            span.setAttribute('class', 'tag');
            span.style.backgroundColor = randomColor();
            span_terms.appendChild(span);
        } else {
            var span2 = span.cloneNode(true);
            span_terms.appendChild(span2);
        }
        
    });
    card.appendChild(span_terms);


    span = document.createElement('span');
    span.textContent = indicator.meta;
    span.classList.add ('meta');
    card.appendChild(span);

    get_plot_values('/values', indicator,card);     
}

function get_plot_vocabularies (endpoint, id){

    var vocabularies = [];
    var vocabulary;
    var url = base_figures_url + endpoint;
    if (id !== null) url += '/' + id;
    
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.setRequestHeader("Content-Type", "application/json");

    request.onload = function() {

        // Begin accessing JSON data here
        var data = JSON.parse(this.response);
        if (id !== null) var items = [data];
        else var items = data['hydra:member'];
console.log(items);
        if (request.status >= 200 && request.status < 400) {
            items.forEach(item => {

                vocabulary = {};
                vocabulary.id = item.id;
                vocabulary.name = item.label;
                vocabulary.internal_name = item.name;
                vocabulary.link = './terms.html?vocabulary.name=' + vocabulary.internal_name + '&vocabulary.id=' + vocabulary.id  ;
                vocabulary.meta =  '';
                Object.keys(item)
                    .forEach(function eachKey(key) {
                        vocabulary.meta = vocabulary.meta + ' / ' + key + ': ' + item[key];
                    });
                vocabularies.push(vocabulary);

                if (id !== null) plot_title(vocabulary);
                else plot_card(vocabulary);
            });
        } else {
            console.error ('Unable to get list of vocabularies');
        }
    }

    request.send();
    return vocabularies;
}

function get_plot_terms (endpoint, vocabulary_name, term_id){

    var terms = [];
    var term;
    var url;
    if (term_id === null ) url = base_figures_url + endpoint + '?vocabulary.name=' + vocabulary_name;
    else url = base_figures_url + endpoint + '/' + term_id;


    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.setRequestHeader("Content-Type", "application/json");

    request.onload = function() {

        // Begin accessing JSON data here
        var data = JSON.parse(this.response);
        var items;
        if (term_id ===null) items = data['hydra:member'];
        else items = [data];

        if (request.status >= 200 && request.status < 400) {
            items.forEach(item => {

                term = {};
                term.id = item.id;
                term.name = item.label;
                term.internal_name = item.name;
                term.link = './term.html?name=' + term.internal_name + '&id=' + term.id;
                term.meta =  '';
                Object.keys(item)
                    .forEach(function eachKey(key) {
                        term.meta = term.meta + ' / ' + key + ': ' + item[key];
                    });
                terms.push(term);

                if (term_id ===null) plot_card(term);
                else plot_title (term);
            });
        } else {
            console.error ('Unable to get list of terms');
        }
    }

    request.send();
    return terms;
}


function read_and_parse(url, base_link, id_attribute) {

    const app = document.getElementById('root');
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
                if ( item.label === undefined ) p.textContent = item.name;
                else p.textContent = item.label;
                p.setAttribute('class', 'title');

                container.appendChild(card);
                var a = document.createElement('a');
                a.href = base_link + item[id_attribute];

                card.appendChild(a);

                a.appendChild(p);

                var span = document.createElement('span');
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

function plot_card(object){
    const container = document.getElementById('container');

    const card = document.createElement('div');
    card.setAttribute('class', 'card');

    container.appendChild(card);

    var a = document.createElement('a');
    a.href = object.link;

    card.appendChild(a);

    const p = document.createElement('p');

    if (object.type === 'country')
       get_plot_country_flag(object.iso3, p);

    p.textContent = object.name;
    p.setAttribute('class', 'title');

    a.appendChild(p);

    var span = document.createElement('span');
    span.textContent = object.meta;
    span.classList.add ('meta');
    card.appendChild(span);   
}

function plot_title(object){
    const container = document.getElementById('header');

    const h2 = document.createElement('h2');

    container.appendChild(h2);

    const p = document.createElement('p');
    h2.appendChild(p);

    if (object.type === 'country')
       get_plot_country_flag(object.iso3, p);

    p.textContent = object.name;
    p.setAttribute('class', 'title');
    
    /*
    var span = document.createElement('span');
    span.textContent = object.meta;
    span.classList.add ('meta');
    h2.appendChild(span);   
     */ 
   
}
