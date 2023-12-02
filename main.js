/// <reference path="jquery-3.7.0.js"/>


$(()=>{

  $(".nav-link").on("click", function () {
    $(".nav-link").removeClass("active");
    $(this).addClass("active");

    $(".cry-page").removeClass("active");
    const page = $(this).data("page");
    $(page).addClass("active");
  });
 

  async function loadCoins() {
    try {
      // const coins = await getJson("https://api.coingecko.com/api/v3/coins/markets?order=market_cap_desc&vs_currency=usd");
      displayCoins(globalCoinsArray);
    } catch (err) {
      alert(err.message);
    }
  }
  loadCoins();

  $("#searchVal").on("click", async () => {

    $(".nav-link").removeClass("active");
    $(`a[data-page="#coins"]`).addClass("active");
    $(".cry-page").removeClass("active");
    const page = $(`a[data-page="#coins"]`).data("page");
    $(page).addClass("active");
    try{
      const textToSearch = $("#searchBox").val();
      const coinsObj = await getJson("https://api.coingecko.com/api/v3/search?query=" + textToSearch );
      const coins = coinsObj.coins
      displayCoins( coins );
    } catch(err) {
      alert(err.message);
    }
    
    
  });

  let global = new Map();
  $(document).on("click", ".infoBtn", async function(){

    const coinId = $(this).data("coinid");
    if(global.has(coinId)){
      const cObj = global.get(coinId);
      const currentTime = Date.now();
      const time = cObj.tStemp;
      const data = cObj.coin;
      if((currentTime - time) < (1000 * 120)){
        displayInfo(data);
        return;
      }

    }

    try{
      const coinId = $(this).data("coinid");
      const coin = await getJson("https://api.coingecko.com/api/v3/coins/" + coinId );
      
      displayInfo(coin);
      global.set(coinId, {
        tStemp: Date.now(), coin
      });
      
      
    } catch(err) {
      alert(err.message);

    }

    

  });

  function displayInfo(coin){
    let content = `
      <div class="card card-body">
              <img src="${coin.image.thumb}" width="30">
              <p>USD :$ ${coin.market_data.current_price.aed}  </p>
              <p>EUR :&#8364 ${coin.market_data.current_price.eur}  </p>
              <p>ILS :&#8362; ${coin.market_data.current_price.ils}  </p>
      </div>
    `;
    $(`#r${coin.id}`).html(content);
  }
  

  function displayCoins(coins) {
    let content = "";
    for (const coin of coins) {
      content += getCoinHtml(coin);
    }

    $("#cardBox").html(content);
  }

  function getCoinHtml(coin) {
    return `
    
    <div class="col">
    
    <div class="card card-body">
    
      <div id="switcher" class="card-header">

        <h5>${coin.symbol.toUpperCase()}</h5>

        <div class="form-check form-switch">
        <label class="form-check-label"></label>
          <input class="form-check-input cryptoBtn b${coin.id}" type="checkbox" role="switch" id=${coin.id} data-switch-id="switch-${coin.id}">
        </div>

      </div>

      <p class="card-text">${coin.name}</p>
      <p class="d-inline-flex">

        <button data-coinid="${coin.id}" class="btn btn-primary infoBtn" type="button" data-press="true"  
                data-bs-toggle="collapse" data-bs-target="#r${coin.id}" aria-expanded="false" aria-controls="r${coin.id}">
          More Info
        </button>
      </p>
      <div class="collapse" id="r${coin.id}">
        <span class="circle-packman-1"></span>
        <div class="card-body">
        </div>
      </div>
    </div>
  </div>
  
    `;
  }


let cryptoArr = [];
let sixObj = null;
let lastcryptoId;

$("body").on("click", ".cryptoBtn", function() {

  const cryptoId = this.id;

  if($(this).is(":checked")){
    if( cryptoArr.length < 5 ){
        cryptoArr.push(cryptoId)
    }else if(cryptoArr.length === 5){
        openModal(cryptoArr)
        $("#listModal").modal("show")
        sixObj = cryptoId;
        lastcryptoId = cryptoId;
    }}else{
        let index = cryptoArr.indexOf(cryptoId)
        if(index !== -1){
            cryptoArr.splice(index , 1)
        }
        if(sixObj){
            cryptoArr.push(sixObj);
            sixObj = null;
        }
    }
  
});

function openModal() {
  const modal = $("#listModal");
  const modalBody = modal.find(".modal-body");

  modalBody.empty();


  for (const coinName of cryptoArr) {
    const checkbox = `<label><input type="checkbox" name="coin" value="${coinName}" checked>${coinName}</label><br>`;
    modalBody.append(checkbox);
  }

  modal.modal('show');

  modalBody.on("change", 'input[type="checkbox"]', function() {
    
    const selectCoin = $(this).val();
    const switchInput = $(".cryptoBtn#" + selectCoin);

    if (!$(this).prop("checked")) {
      cryptoArr = cryptoArr.filter(coin => coin !== selectCoin);
      switchInput.prop("checked", false);
      
      
      if (cryptoArr.length < 5 ) {
        const sixCoinId = sixObj;
        
        cryptoArr.push(sixCoinId);
        $(".cryptoBtn#" + sixCoinId).prop("checked", true);
        $("#listModal").modal("hide");
      }
    }

    
  });
}




  function getJson(url) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url,
        success: (data) => resolve(data),
        error: (err) => reject(err.statusText),
      });
    });
  }
      

})

    

    