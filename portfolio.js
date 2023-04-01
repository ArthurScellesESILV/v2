// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

/*
Description of the available api
GET https://clear-fashion-api.vercel.app/
Search for specific products
This endpoint accepts the following optional query string parameters:
- `page` - page of products to return
- `size` - number of products to return
GET https://clear-fashion-api.vercel.app/brands
Search for available brands list
*/


// current products on the page
let currentProducts = [];
let currentPagination = {};

// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const sectionProducts = document.querySelector('#products');
const spanNbProducts = document.querySelector('#nbProducts');
const selectBrand=document.querySelector('#brand-select');
const selectSort=document.querySelector('#sort-select');
const RecentlyReleased=document.querySelector('#recent');
const ReasonablePrice=document.querySelector('#price');
const spanNbBrands=document.querySelector('#nbBrands');
const spanNewProducts=document.querySelector('#newProducts');
const spanP50=document.querySelector('#p50');
const spanP90=document.querySelector('#p90');
const spanP95=document.querySelector('#p95');
const spanLastReleased=document.querySelector('#lastReleased')
/**
 * Set global value
 * @param {Array} result - products to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentProducts = ({result, meta}) => {
  currentProducts = result;
  currentPagination = meta;
};

/**
 * Fetch products from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @return {Object}
 */
const fetchProducts = async (size = 12, brand = null, sort=null,price) => {
  let api;
  try {
    if (brand==null ||brand ==undefined ||brand =="") {
      api = `https://server-psi-murex.vercel.app/products/search?limit=3000&price=${price}`;
    }
    if(price == undefined){
      api = `https://server-psi-murex.vercel.app/products/search?limit=3000&brandName=${brand}`;
    }
    if((brand == undefined || brand == null ||brand =="")&& price==undefined){
      api = `https://server-psi-murex.vercel.app/products/search?limit=3000`;
    }
    if((brand!== undefined && brand !== null ||brand !=="") && price!==undefined) {
      api = `https://server-psi-murex.vercel.app/products/search?limit=3000}&brandName=${brand}&price=${price}`;
    }
    const response = await fetch(api);
    const body = await response.json();
    

    switch (sort) {
      case 'price-desc':
          body.result= body.result.sort((a, b) => b.price - a.price);
          break;
      case 'price-asc':
          body.result= body.result.sort((a, b) => a.price - b.price);
          break;
      case 'date-asc':
          body.result = body.result.sort((a, b) => new Date(b.date) - new Date(a.date));
          break;
      case 'date-desc':
          body.result = body.result.sort((a, b) => new Date(a.date) - new Date(b.date));
          break;
    }

    console.log(body.result.length)
    console.log(size)
    if (body.result.length > size) {    
      body.result = body.result.slice(0, size);
    }
    else {
      body.result = body.result.slice(0, body.result.length-1);
    }


    console.log(body)

    
    return body;
    
  } catch (error) {
    console.error(error);
    return {currentProducts, currentPagination};
  }
};



/**
 * Render list of products
 * @param  {Array} products
 */
const renderProducts = products => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  const template = products
    .map(product => {
      return `
      <div class="product">
      <div class="product-img">
        <img src="${product.img}" alt="${product.name}" width="200" height="200">
      </div>
      <div class="product-info">
        <div class="product-brand">${product.brandName}</div>
        <div class="product-name"><a href="${product.link}" target="_blank">${product.name}</a></div>
        <div class="product-price">$${product.price}</div>
      </div>
    </div>
    `;
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionProducts.innerHTML = '';
  sectionProducts.appendChild(fragment);
};


const renderIndicators = products => {
  const {count} = products;
 
  spanNbProducts.innerHTML=ProductIndicator(products.result);
  //Feature 8 - Number of products indicator
  spanNbBrands.innerHTML=BrandsIndicator(products.result);
  //Feature 9 - Number of recent products indicator
  spanNewProducts.innerHTML= NewProductsIndicator(products.result) ;
  //Feature 10 - p50, p90 and p95 price value indicator
  spanP50.innerHTML=p50(products.result);
  spanP90.innerHTML=p90(products.result);
  spanP95.innerHTML=p95(products.result);
  //Feature 11 - Last released date indicator
  spanLastReleased.innerHTML=lastReleased(products.result);
};



const render = (products) => {
  renderProducts(products);
};

function ProductIndicator(products)
{
  const PSet = new Set();
  for (let i = 0; i < products.length; i++) {
    PSet.add(products[i]);
  }
  return PSet.size;
}
/**
 * Brands Indicator
 * @param  {Object} products
 */
function BrandsIndicator(products)
{
  const brandSet = new Set();
  for (let i = 0; i < products.length; i++) {
    brandSet.add(products[i].brandName);
  }
  return brandSet.size;
}
/**
 * Number of recent products indicator
 * @param  {Object} products
 */
function NewProductsIndicator(product){
  const today= new Date();
  const week= new Date(today.getDate() - - 7 * 24 * 60 * 60 * 1000);
  const newproducts=product.filter(product=> Date (product.date)>week);
  return newproducts.length

}
/**
 * P50 value
 * @param  {Object} product
 */
function p50(product)
{
const prices=product.map(product => product.price);
prices.sort((a, b) => a - b);
const index = Math.ceil((50 / 100) * prices.length) - 1;
const p90 = prices[index];
return p90
}
/**
 * P90 value
 * @param  {Object} product
 */
function p90(product)
{
  const prices=product.map(product => product.price);
  prices.sort((a, b) => a - b);
  const index = Math.ceil((90 / 100) * prices.length) - 1;
  const p90 = prices[index];
  return p90
}
/**
 * P95 value
 * @param  {Object} product
 */
function p95(product)
{
  const prices=product.map(product => product.price);
  prices.sort((a, b) => a - b);
  const index = Math.ceil((95 / 100) * prices.length) - 1;
  const p90 = prices[index];
  return p90
}

/**
 * Last Released product date
 * @param  {Object} product
 */
function lastReleased(product){
  //sort product by date from the newest to the oldest
  product.sort((a, b)=> new Date(b.date)-new Date(a.date))
  return product[0].date
}
document.addEventListener("DOMContentLoaded",async()=>
{
  const products = await fetchProducts();
  spanNbProducts.innerHTML=ProductIndicator(products.result);
  //Feature 8 - Number of products indicator
  spanNbBrands.innerHTML=BrandsIndicator(products.result);
  //Feature 9 - Number of recent products indicator
  spanNewProducts.innerHTML= NewProductsIndicator(products.result) ;
  //Feature 10 - p50, p90 and p95 price value indicator
  spanP50.innerHTML=p50(products.result);
  spanP90.innerHTML=p90(products.result);
  spanP95.innerHTML=p95(products.result);
  //Feature 11 - Last released date indicator
  spanLastReleased.innerHTML=lastReleased(products.result);
  setCurrentProducts(products);
  render(currentProducts);
})


/**
 * Select the number of products to display
 */
selectShow.addEventListener('change', async (event) => {
  const products = await fetchProducts(parseInt(event.target.value,selectBrand.value,selectSort.value,3000));
  setCurrentProducts(products);
  renderIndicators(products)
  render(currentProducts);
});

selectBrand.addEventListener('change', async (event) => {
  const products = await fetchProducts(selectShow.value,event.target.value,selectSort.value,3000);
  
  setCurrentProducts(products);
  renderIndicators(products)
  render(currentProducts);
});

ReasonablePrice.addEventListener('click',async()=>{
  const products = await fetchProducts(selectShow.value,selectBrand.value,selectSort.value,50);
  
  setCurrentProducts(products);
  renderIndicators(products)
  render(currentProducts);
});

selectSort.addEventListener('change', async () => {
  const products = await fetchProducts(selectShow.value,selectBrand.value,event.target.value,3000);
  
  setCurrentProducts(products);
  renderIndicators(products)
  render(currentProducts);
});

const minPriceInput = document.getElementById('min-price');
const maxPriceInput = document.getElementById('max-price');
const priceFilterBtn = document.getElementById('price-filter-btn');

priceFilterBtn.addEventListener('click', async () => {
  const minPrice = parseInt(minPriceInput.value) || 0;
  const maxPrice = parseInt(maxPriceInput.value) || 3000;
  const products = await fetchProducts(selectShow.value,selectBrand.value,selectSort.value,maxPrice);
  products.result = products.result.filter(product => product.price >= minPrice && product.price <= maxPrice);
  setCurrentProducts(products);
  renderIndicators(products)
  render(currentProducts);
});

const searchNameInput = document.getElementById('searchName');
const searchBtn = document.getElementById('searchBtn');

searchBtn.addEventListener('click', async () => {
  const searchValue = searchNameInput.value.trim();
  console.log(searchValue)
  const products = await fetchProducts(selectShow.value,selectBrand.value,selectSort.value,3000);
  console.log(products)
  products.result = products.result.filter(product => product.name.toLowerCase().includes(searchValue.toLowerCase()));

  setCurrentProducts(products);
  renderIndicators(products)
  render(currentProducts);
});
