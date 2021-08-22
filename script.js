function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

function createProductItemElement({ sku, name, image }) {
  const section = document.createElement('section');
  section.className = 'item';
  
  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  section.appendChild(createCustomElement('button', 'item__add', 'Adicionar ao carrinho!'));
  
  return section;
}

// function getSkuFromProductItem(item) {
//   return item.querySelector('span.item__sku').innerText;
// }

function cartItemsSelection() {
  return document.querySelector('.cart__items');
}

function cartSaving() {
  localStorage.setItem('cartList', cartItemsSelection().innerHTML);
}

function setPrice(selection) {
  const totalPriceSelection = document.querySelector('.total-price');
  let summation = 0;
  for (let index = 0; index < selection.length; index += 1) {
    const element = selection[index];
    const splitedElement = element.innerText.split(' ');
    const price = splitedElement[splitedElement.length - 1];
    const splitedPrice = price.split('');
    splitedPrice.shift();
    const joinedPrice = splitedPrice.join('');
    const parsedPrice = parseFloat(joinedPrice);
    summation += parsedPrice;
  }
  /** https://www.horadecodar.com.br/2020/12/07/como-verificar-se-variavel-e-float-ou-inteiro-em-javascript/ */
  const formattedSummation = summation
    .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  totalPriceSelection.innerHTML = `TOTAL: ${formattedSummation}`;
}

function sumCalc() {
  const totalPriceSelection = document.querySelector('.total-price');
  const itemSelection = document.querySelectorAll('.cart__item');
  const initialPrice = 0;
  const formattedPrice = initialPrice
  .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });// https://www.alura.com.br/artigos/formatando-numeros-no-javascript
  if (itemSelection.length === 0) {
    totalPriceSelection.innerHTML = `TOTAL: ${formattedPrice}`;
  } else {
    setPrice(itemSelection);
  }
}

function cartItemClickListener(event) {
  event.target.remove();
  cartSaving();
  sumCalc();
}

function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  return li;
}

async function AssyncMLPricesByIDFetching(url) {
  try {
    const MLPricesURLFetching = await fetch(url);
    const jsonParsing = await MLPricesURLFetching.json();
    const keyRearranges = {
      sku: jsonParsing.id,
      name: jsonParsing.title,
      salePrice: jsonParsing.price,
    };
    cartItemsSelection().appendChild(createCartItemElement(keyRearranges));
    cartSaving();
    sumCalc();
  } catch (error) {
    console.log(error);
  }
}

function setURL(id) {
  const URLPattern = `https://api.mercadolibre.com/items/${id}`;
  AssyncMLPricesByIDFetching(URLPattern);
}

function clickAddition() {
  const buttonsSelection = document.querySelectorAll('.item__add');
  buttonsSelection.forEach((element) => element.addEventListener('click', (event) => {
    const IDTaking = event.target.parentElement.firstElementChild.innerText;
    setURL(IDTaking);
  }));
}

async function AssyncMLFetching(query) {
  try {
    const productsFromAPI = await fetch(`https://api.mercadolibre.com/sites/MLB/search?q=${query}`);
    const jsonParsing = await productsFromAPI.json();
    const resultsFromApi = jsonParsing.results;
    const teste2 = document.querySelector('.items');
    teste2.removeChild(document.querySelector('.loading'));
    resultsFromApi.forEach(({ id, title, thumbnail }) => {
      const keyRearrange = { sku: id, name: title, image: thumbnail };
      const ProductItemElementCreation = createProductItemElement(keyRearrange);
      document.querySelector('.items').appendChild(ProductItemElementCreation);
    });
    clickAddition();
  } catch (error) {
    console.log(error);
  }
}

function sumElement() {
  const pTag = document.createElement('p');
  pTag.className = 'total-price';
  document.querySelector('.cart').appendChild(pTag);
}

function setProductsFromLocalStorage() {
  if (localStorage.length > 0) {
    cartItemsSelection().innerHTML = localStorage.getItem('cartList');
    document.querySelectorAll('.cart__item').forEach((product) => {
      product.addEventListener('click', cartItemClickListener);
    });
  }
}

function emptyCartSelection() {
  return document.querySelector('.empty-cart');
}

function emptyCart() {
  emptyCartSelection().addEventListener('click', () => {
    localStorage.removeItem('cartList');
    const olSelection = document.querySelector('.cart__items');
    /** Source: https://www.geeksforgeeks.org/remove-all-the-child-elements-of-a-dom-node-in-javascript/#:~:text=Child%20nodes%20can%20be%20removed,which%20produces%20the%20same%20output. */
    let childElement = olSelection.lastElementChild;
    while (childElement) {
      olSelection.removeChild(childElement);
      childElement = olSelection.lastElementChild;
    }
    sumCalc();
  });
}

function addLoadingImg() {
  const imgTagCreation = document.createElement('img');
  const itemsSectionSelection = document.querySelector('.items');
  const gifCreation = itemsSectionSelection.appendChild(imgTagCreation);
  gifCreation.src = 'loading.gif';
  gifCreation.className = 'loading';
}

function removeItems() {
  const itemsSelection = document.querySelector('.items');
  while (itemsSelection.firstChild) {
    itemsSelection.removeChild(itemsSelection.firstChild);
  }
}

function setCategory() {
  const buttonSelection = document.querySelector('.btn');
  const inputSelection = document.querySelector('.input');
  buttonSelection.addEventListener('click', () => {
    removeItems();
    addLoadingImg();
    AssyncMLFetching(inputSelection.value);
    inputSelection.value = '';
    sumElement(); 
    setProductsFromLocalStorage();
    emptyCart();
    sumCalc();
    clickAddition();
  });
}

window.onload = () => {
  setCategory();
  sumElement();
  setProductsFromLocalStorage();
  emptyCart();
  sumCalc();
 };
