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

function getSkuFromProductItem(item) {
  return item.querySelector('span.item__sku').innerText;
}

function cartItemsSelection() {
  return document.querySelector('.cart__items');
}

function cartSaving() {
  localStorage.setItem('cartList', cartItemsSelection().innerHTML);
}

function sumCalc() {
  const itemSelection = document.querySelectorAll('.cart__item');
  if (itemSelection.length === 0) {
    document.querySelector('.total-price').innerHTML = 0;
  } else {
    let summation = 0;
    for (let index = 0; index < itemSelection.length; index += 1) {
      const element = itemSelection[index];
      const splitedElement = element.innerText.split(' ');
      const price = splitedElement[splitedElement.length - 1];
      const splitedPrice = price.split('');
      splitedPrice.shift();
      const joinedPrice = splitedPrice.join('');
      const parsedPrice = parseFloat(joinedPrice);
      summation += parsedPrice;
    }
    const fixedSummation = summation.toFixed(2);
    /** https://www.horadecodar.com.br/2020/12/07/como-verificar-se-variavel-e-float-ou-inteiro-em-javascript/ */
    if(Number.isInteger(summation) || Number.isInteger(summation * 10)) {
      document.querySelector('.total-price').innerHTML = summation;
    } else {
      document.querySelector('.total-price').innerHTML = fixedSummation;
    }
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

async function AssyncMLFetching(query) {
  try {
    const productsFromAPI = await Promise
    .all(fetch(`https://api.mercadolibre.com/sites/MLB/search?q=${query}`)
      .then((response) => response.json())
      .then((resultList) => resultList.results
        .forEach(({ id, title, thumbnail }) => {
          const keyRearrange = { sku: id, name: title, image: thumbnail };
          const ProductItemElementCreation = createProductItemElement(keyRearrange);
          document.querySelector('.items').appendChild(ProductItemElementCreation);
        })));
  } catch (error) {
    console.log(error);
  }
}

async function AssyncMLPricesByIDFetching(url) {
  try {
    const jsonParsing = await fetch(url).then((response) => response.json());
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
  setTimeout(() => {
    const buttonsSelection = document.querySelectorAll('.item__add');
    buttonsSelection.forEach((element) => element.addEventListener('click', (event) => {
      const IDTaking = event.target.parentElement.firstElementChild.innerText;
      setURL(IDTaking);
    }));
  }, 100);
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

window.onload = () => {
  AssyncMLFetching('computador');
  clickAddition();
  sumElement();
  setProductsFromLocalStorage();
  emptyCart();
  sumCalc();
 };
