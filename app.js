const form = document.querySelector('#form');
const input1 = document.querySelector('#input1');
const input2 = document.querySelector('#input2');

const coin1 = document.querySelector('#coin1');
const coin2 = document.querySelector('#coin2');

const show = document.querySelector('.show');

//currency
let defaultLang = '';
if(!localStorage.getItem('lang')) {
    localStorage.setItem('lang' , 'usd');
    defaultLang = localStorage.getItem('lang');
}else {
    defaultLang = localStorage.getItem('lang');
}

const lang = document.querySelector('#lang');
const langArray = [ "aud", "bdt", "btc", "cad", "chf", "cny", "eth", "eur", "gbp", "jpy", "nzd",  "sek", "usd"]

//add option to html 
langArray.forEach(eachLang => {
    lang.innerHTML += `<option value="${eachLang}">${eachLang}</option>`;
})
//select default lang HTML
langHTMLarray = Array.from(lang.children);
langHTMLarray.forEach(option => {
    if(option.getAttribute('value') === defaultLang) {
        option.setAttribute("selected" , "selected")
    }
})

lang.addEventListener('change' , e=> {
    localStorage.setItem('lang' , `${e.target.value}`);
    defaultLang = localStorage.getItem('lang');


    const input1Value = input1.value.trim().toLowerCase();
    const input2Value = input2.value.trim().toLowerCase();

    if(input1Value && input2Value) {
        generateData(input1Value , coin1);
        generateData(input2Value , coin2);
    }

    console.log(defaultLang)
})


//fetch DATA
const generateData = async (id , htmlDiv) => {
    show.classList.remove('hide');
    
    try {
    const coinID = id;
    const localization = true;
    const tickers = true;
    const market_data = true;
    const community_data =true;
    const developer_data = true;
    const sparkline = false;

    const base = `https://api.coingecko.com/api/v3/coins/${coinID}?localization=${localization}&tickers=${tickers}}
    &market_data=${market_data}&community_data=${community_data}&developer_data=${developer_data}&sparkline=${sparkline}`;

    const res = await fetch(base);
    const data = await res.json();
    
    //display data function call
    uiUpdate(data , htmlDiv , defaultLang)

    }
    catch(e) {

        const headingHTML = htmlDiv.children[0];
        const categoryHTML = htmlDiv.children[1];
        const dataHTML = htmlDiv.children[2];
        const socialHTML = htmlDiv.children[3];

        headingHTML.innerHTML = `
            <h3>Error</h3>
        `;
        categoryHTML.innerHTML = ``;
        dataHTML.innerHTML= `
        <ul class="error-ul">
            <li>Use valid <a href="https://www.coingecko.com/en">Coin</a> </li>
            <li>Check Coin Spelling</li>
            <li>Use hypehen(-) for multiple word Coins (e.g usd-coin)</li>
            <li>Contact <a href="https://munemprionto.netlify.app/">developer</a></li>
        </ul>
        `;
        socialHTML.innerHTML = ``;
    
        console.log(e)
    }
}
function uiUpdate(data, parentElement , currencyName) {
    //format numbers
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: `${defaultLang.toUpperCase()}`,
      });

    //get html elements

    const headingHTML =parentElement.children[0];
    const categoryHTML = parentElement.children[1];
    const dataHTML = parentElement.children[2];
    const socialHTML = parentElement.children[3];

    //current price
    const currentPrice = numberWithCommasDecimal(data.market_data.current_price[`${currencyName}`]); 

    //history
    const last_1_h = data.market_data.price_change_percentage_1h_in_currency[`${currencyName}`].toFixed(2);
    const last_24_h = data.market_data.price_change_percentage_24h_in_currency[`${currencyName}`].toFixed(2);
    const last_7_d = data.market_data.price_change_percentage_7d_in_currency[`${currencyName}`].toFixed(2);
    const last_30_d = data.market_data.price_change_percentage_30d_in_currency[`${currencyName}`].toFixed(2);

    //supply
    const circulatingSupply = data.market_data.circulating_supply;
    const maxSupply = data.market_data.max_supply;

    let circulatingSupply_formated = 0;
    let  maxSupply_formated = 0;

    if(typeof(circulatingSupply) === 'number') {
        circulatingSupply_formated = circulatingSupply.toLocaleString();
    }else {
        circulatingSupply_formated = '∞';
    }

    if(typeof(maxSupply) === 'number') {
        maxSupply_formated = maxSupply.toLocaleString();
    }else {
        maxSupply_formated = '∞';
    }

    //24 history
    const high_24h = formatter.format(data.market_data.high_24h[`${currencyName}`]);
    const low_24h = formatter.format(data.market_data.low_24h[`${currencyName}`]);


    //links
    const fb = `https://www.facebook.com/${data.links.facebook_username}`;
    const reddit = data.links.subreddit_url;
    const twitter = `https://twitter.com/${data.links.twitter_screen_name}`;
    const github =  data.links.repos_url.github[0];

    //data to html
    headingHTML.innerHTML = 
    `
    <img src="${data.image.small}" alt="${data.name}-logo" srcset="">
    <a href="${data.links.homepage[0]}">${data.name} (${data.symbol.toUpperCase()})</a>
    `;
    
    categoryHTML.innerHTML = 
    `
    <span class="eachCategory">${data.categories[0]}</span>
    `;

/*      //too many categories    
        data.categories.forEach((category , i) => {
        categoryHTML.innerHTML += 
        `   <span class="eachCategory category-${i+1}">${category}</span>
        `;
    }) 
*/
    dataHTML.innerHTML = 
    `    <div>Rank (Mkt Cap) : <span class="mktCapRank"> ${data.market_data.market_cap_rank}</span></div>
        <div class="price" data-price="${data.market_data.current_price}">Price : ${currentPrice} ${currencyName.toUpperCase()}</div>
        <div class="historyPrice">
            <p><span class="time" >1h</span>   <span class="number">${last_1_h}</span> %</p>
            <p><span class="time">24h</span>  <span class="number">${last_24_h}</span> %</p>
            <p><span class="time" >7d</span>   <span class="number">${last_7_d}</span> %</p>
            <p><span class="time" >30d</span>   <span class="number">${last_30_d}</span> %</p>
        </div>
        <div>Market Cap  <p class="mktCap">${formatter.format(data.market_data.market_cap[currencyName])}</p> </div>
        <div class="supply">
            <p>Supply</p>
            <span>${circulatingSupply_formated}</span> / 
            <span>${maxSupply_formated}</span>
        </div>
        <div class="history24">
            <p> 24h High(&uarr;) <span class="24_high green">${high_24h}</span></p>
            <p> 24h Low (&darr;) <span class="24_low red">${low_24h}</span>
        </div>  
        <div class="gensisDate"> Genesis : ${data.genesis_date}</div>  
        <div class="hashingAlgorithm">Hashing Algorithm : ${data.hashing_algorithm}</div> 
    `;
    socialHTML.innerHTML = 
    `
        <a href="${fb}" target="_blank"><ion-icon name="logo-facebook"></ion-icon></a>
        <a href="${twitter}"target="_blank"><ion-icon name="logo-twitter"></ion-icon></a>
        <a href="${reddit}"target="_blank"><ion-icon name="logo-reddit"></ion-icon></a>
        <a href="${github}" target="_blank"><ion-icon name="logo-github"></ion-icon></a>
        `;
    
    //red or green
    const numberSpan = document.querySelectorAll('.number');
    numberSpan.forEach(span => {
        if(Math.sign(+span.textContent) === 1) {
            span.classList.add('green')
        }else if(Math.sign(+span.textContent) === -1) {
            span.classList.add('red')
        }
    })
}

//submit event
form.addEventListener('submit' , e=> {
    e.preventDefault();

    const input1Value = input1.value.trim().toLowerCase();
    const input2Value = input2.value.trim().toLowerCase();

    if(input1Value && input2Value) {
        generateData(input1Value , coin1);
        generateData(input2Value , coin2);
    }
  
})
//formating nubmer with comma
function numberWithCommasDecimal(x) {
    return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

