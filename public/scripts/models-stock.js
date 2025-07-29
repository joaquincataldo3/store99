let stockModels = [];

document.addEventListener(('DOMContentLoaded'), async () => {
    loadAllStocks();
})

async function loadAllStocks(){
    const response = await fetch('/api/stock');
    const responseJson = await response.json();
    console.log(responseJson)
}