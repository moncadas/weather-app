let geoApi = config.API_GEO;
let weatApi = config.API_WEATHER;
let hourly;
let selectedDay;

/* ______PAGE LOAD________*/
window.addEventListener("load", function() {
    //get the numeric date for today and tomorrow
    const data = new Date();
    document.getElementById('today').textContent = data.getDate() + "/" + (data.getMonth()+1) + "/" + data.getFullYear();
    document.getElementById('tomorrow').textContent = (data.getDate()+1) + "/" + (data.getMonth()+1) + "/" + data.getFullYear();
    selectedDay = 'today'
})

/* ______DAYS SELECTION________*/
function changeSelection(sender) {
    let daysCards = document.getElementsByClassName('dayOfWeek')
    for (let i = 0; i<daysCards.length ; i++) {
        //reset every cards to non selected
        daysCards[i].className = 'dayOfWeek'
    }

    //select the choosen card
    let newSelection = sender.currentTarget
    newSelection.className += " selectedDay"   
    //change the info for the selected day  
    changeDay(sender.currentTarget.children[0].textContent)
}

/* ______DAYS CHANGE________*/
function changeDay(day) {
    day === 'Today' ? selectedDay = 'today' : selectedDay = 'tomorrow'    
    addForecast()
}

/* ______SHOWS FORECAST________*/
async function loadData() {    
    let city = document.getElementById('searchBar').value
    let positionEndpoint = `http://api.positionstack.com/v1/forward?access_key=${geoApi}&query=${city}&limit=1`

    //get coordinates of the specified city
    const result = await fetch(positionEndpoint)
        .then(response => response.json())
        .then(data => {
            lat = data.data[0].latitude
            lon = data.data[0].longitude
            //uses the coordinates to complete the endpoint to the weather api
            let weatherEndpoint = `http://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&dt=1614333287&lang=en&units=metric&appid=${weatApi}` 
            return fetch(weatherEndpoint)
        })
        .then(response => response.json())
        .then(data =>  {
            //get the weather info for the next 48 hours
            hourly = data.hourly
            addForecast()            
            document.getElementById('dataSection').className = ""
        })
        .catch(err => console.log(err));
}


function addForecast() {    
    const currentHour = new Date().getHours()
    const list = document.getElementById('weatherList')
    list.innerHTML = ""

    let start 
    let end

    //the api shows 48 hours from the current hour
    if (selectedDay === 'today') {
        start = 0
        // ex: 24 - 17 = will show 7 hour from now
        end = 24 - currentHour
    } else if (selectedDay === 'tomorrow') {
        // ex: 24 - 17 + 1 = the hourly object will be used from the 8th position onward, which is the following day.        
        start = 24 - currentHour + 1
        end = start + 23
    }

    for (let i = start; i <= end; i++) {
        const newItem = document.createElement('li')
        newItem.className = "hourlyLI"

        newItem.appendChild(createHourSection(i))
        newItem.appendChild(createIconSection(i))
        newItem.appendChild(createTempSection(i))           
        newItem.appendChild(createSectionTwoLine("humidity", hourly[i].humidity + "%"))
        newItem.appendChild(createSectionTwoLine("wind", hourly[i].wind_speed + " m/s"))
        newItem.appendChild(document.createElement('hr'))

        list.appendChild(newItem)
    }
}

function createHourSection(lineCount) {
    const hoursSpan = createTwoLineSpan()

    const hourText = document.createElement('span')
    hourText.textContent = "hour"
    hoursSpan.appendChild(hourText)
    
    //convert unix timestamp
    let date = new Date(hourly[lineCount].dt * 1000);   
    let hourNum = date.getHours()
    //for readility convert 0 to 24
    hourNum === 0 ? hourNum = 24 : hourNum 

    const hour = createLine(0, hourNum)
    hoursSpan.appendChild(hour)

    return hoursSpan
}

function createIconSection(i) {
    const weatherIco = document.createElement('img')
    weatherIco.className = "weatherIco"
    weatherIco.setAttribute("src", `http://openweathermap.org/img/wn/${hourly[i].weather[0].icon}@2x.png`)    

    return weatherIco
}

function createTempSection(i) {
    const temperature = createLine(2, Math.floor(hourly[i].temp) + "°")
        
    return temperature
}

function createSectionTwoLine(descr, specific) {
    const container = createTwoLineSpan()

    const line1 = createLine(1, descr)    
    container.appendChild(line1)

    const line2 = createLine(2, specific)    
    container.appendChild(line2)

    return container
}

function createTwoLineSpan() {
    const span = document.createElement('span')
    span.className = 'twoLineContainer'
    return span
}

function createLine(lineNum, text) {
    const span = document.createElement('span')    
    if (lineNum === 1) {
        span.className = "textDescr"
    } else if (lineNum === 2 ) {
        span.className = "textWeather"
    } else {
        span.className = "textHour"
    }

    span.textContent = text

    return span
}