// Оголошуємо об'єкт shop
const shop = function () {

   /**
    * Функції помічники
    */

   // Зберігаємо дані в localstorage
   this.saveLocal = (keyStr, value) => {

      // Зберігаємо в localstorage
      localStorage.setItem(keyStr, JSON.stringify(value));
   }

   // Дістаємо дані з localstorage
   this.getLocal = (keyStr) => {

      return JSON.parse(localStorage.getItem(keyStr)) ?? [];

      // // Повертаємо дані з localstorage
      // let res = localStorage.getItem(keyStr);

      // res = JSON.parse(res);

      // if (res == null) {
      //    res = [];
      // }

      // return res;
   }

   // Перевірка товару на дублікат
   this.isProductInCart = (cart, productId) => {
      // Повертаю булеве значення існування товару в корзині
      return cart.some(item => item.id === productId);
   }


   // Змінні для роботи об'єкту
   this.catalog = document.querySelectorAll('.js-catalog-cards');
   this.catalogMain = document.querySelector('#catalog-cards');
   this.category = document.querySelector('#js-category');
   this.categoryBtn = document.querySelector('.dropdown-btn');
   this.countProducts = document.querySelector('#count-products');
   this.displayProductCart = document.querySelector('#js-cart-added-list');
   this.cartBtn = document.querySelector('#js-cart-added-btn');
   this.cartProductNum = document.querySelectorAll('.js-cart-added-summ');
   this.inputSearch = document.querySelector('#js-input-search');


   // Змінна для timeout
   this.idTimeout = 0;

   // Масив обранних товарів
   this.cart = this.getLocal('cart');

   // Посилання для api
   this.apiLink = 'https://64fecbcdf8b9eeca9e291654.mockapi.io/';
   this.apiCatalog = this.apiLink + 'catalog';
   this.apiCatalogHotOffer = this.apiCatalog + '?hotoffer=yes';
   this.apiSearch = this.apiCatalog + '?search=';
   this.apiCategories = this.apiLink + 'categories';

   // Виводимо всі товари в html
   this.diplayProducts = (array, viewInThisBlock = this.catalogMain) => {

      // Перевірка на існування
      if (viewInThisBlock) {

         // Очищуємо карточки перед виводом
         viewInThisBlock.innerHTML = '';

         // Перевіряємо масив на пустоту
         if (array.length == 0) {

            // Виводимо повідомлення NO RESULTS
            viewInThisBlock.innerHTML = `<h2 class="no-result">No products found</h2>`;

         } else {

            // Перебираємо товари для виводу
            array.forEach(({ img, title, price, oldprice, hotoffer, catid, id }) => {

               // Виводимо товари 
               viewInThisBlock.insertAdjacentHTML('beforeend', `<div class="card-product">
                                                   <div class="card-product__img-hold d-flex-center">
                                                      <img src="img/catalog/${img}" alt="" class="card-product__img js-product-img">
                                                   </div>
                                                   <div class="card-product__text-hold">
                                                      <a href="#" class="card-product__title-link">${title}</a>
                                                      <span class="card-product__price">${price} USD <small>${oldprice} USD</small></span>
                                                      <a href="#" class="card-product__btn-add js-icon-cart" data-id="${id}" data-title="${title}" data-price="${price}" data-img="${img}" data-count="1"><svg class='icon icon-cart'><use xlink:href='#icon-cart-add'></use></svg></a>
                                                   </div>
                                                </div>`)
            });
         }
      }
   }


   // Вивід всіх категорій в html
   this.diplayCategory = (array) => {

      //Перевірка на існування
      if (this.category) {

         //Виводимо категорії
         this.category.insertAdjacentHTML('beforeend', `<a href="#" class="dropdown-item">Reset selection</a>`)

         // Перебираємо категорії
         array.forEach(({ id, title }) => {

            //Виводимо категорії
            this.category.insertAdjacentHTML('beforeend', `<a href="${id}" class="dropdown-item">${title}</a>`)

         })
      }
   };


   // Підраховуємо та виводимо цифрою загальну кіл-ть товару
   this.displayCountProducts = (array) => {

      // Виводимо цифру в html
      this.countProducts.innerHTML = array.length;
   }


   // Вивід товарів до каталогу
   this.viewPorducts = () => {

      // Витягуємо товари з бази даних
      fetch(this.apiCatalog)
         .then(res => res.json())
         .then((products) => {

            // Перебираємо товари для виводу
            this.diplayProducts(products);

            // Оновлюємо кількість товарів
            this.displayCountProducts(products);

         })
   }


   // Вивід акційних товарів
   this.viewPorductsHot = () => {

      // Витягуємо товари з бази даних
      fetch(this.apiCatalogHotOffer)
         .then(res => res.json())
         .then((products) => {

            // Отримуємо елемент блоку з акційними пропозиціями
            const hotOffer = document.querySelector('.js-hotoffers');

            // Перебираємо товари для виводу
            this.diplayProducts(products, hotOffer);

         })
   }


   // Вивід категорій
   this.viewCategories = () => {

      // Витягуємо категорії з бази даних
      fetch(this.apiCategories)
         .then(res => res.json())
         .then((categories) => {

            // Виводимо категорії
            this.diplayCategory(categories);
         })
   }


   // Виводимо товари по певній категорії
   this.setCategoryProducts = (e) => {

      // Забороняємо стандратний функціонал html
      e.preventDefault();

      // Зберігаємо результат кліку
      const el = e.target;

      // Дістаємо id категорії
      const idCategory = el.getAttribute('href');

      // Витягуємо товари з бази даних
      fetch(this.apiCatalog + '?catid=' + idCategory)
         .then(res => res.json())
         .then((products) => {

            // Виводим товари
            this.diplayProducts(products);

            // Оновлюємо кількість товарів
            this.displayCountProducts(products);

         })
   }


   // Добавляємо товар в корзину
   this.addNewProduct = (el) => {

      // Збираємо дані про товар
      const product = el.dataset;

      if (!this.isProductInCart(this.cart, product.id)) {

         // Добавляємо товар до масива
         this.cart.push(product);

         // Виводимо товари в корзину
         this.viewCartProducts();

         // Оновлюємо число доданих товарів в корзині
         this.setCountCartProducts();
      }

   }


   // Функція виводу кількості добавлених товарів
   this.setCountCartProducts = () => {

      // Створюємо змінну де буде зберігатись кіл-ть доданних товарів
      this.totalItemCount = 0;

      // Перебираю масив об'єктів корзини, щоб отримати count
      for (this.item of this.cart) {

         // Підсумовую загальну кількість товарів
         this.totalItemCount += parseInt(this.item.count);
      }

      //Виводимо результат в html
      this.cartProductNum.forEach((el) => {
         el.innerHTML = this.totalItemCount;
      })
   }


   // Слідкуємо за зміною кіл-ті товарів в корзинці
   this.onChangeProductQuantity = () => {

      //отримуємо атрибут із елемента (plus or minus)
      this.btnTypeVal = this.el.getAttribute('data-type');

      //отримуємо атрибут з кнопки, щоб зв'язати з інпутом
      this.dataInputVal = this.el.getAttribute('data-input');

      // Зберігаю необхідний інпут
      this.input = document.querySelector(this.dataInputVal);

      // Отримуємо поточне значення інпута
      this.count = parseInt(this.input.value);

      if (this.btnTypeVal === 'plus') {
         this.input.value++;
      }

      if (this.btnTypeVal === 'minus' && this.count > 1) {
         this.input.value--;
      }

      // Ключ в масиві cart
      this.cartIndex = this.el.getAttribute('data-index');

      // Оновлювати цифру в масиві віносно товару
      this.cart[this.cartIndex].count = this.input.value;

      // Зберігати корзину в localstorage
      this.saveLocal('cart', this.cart);

      // Виводимо кількість добавлених товарів
      this.setCountCartProducts();
   }


   // Виводимо товар в корзину
   this.viewCartProducts = () => {

      // Очищуємо від старого результату
      this.displayProductCart.innerHTML = '';

      // Зберігаємо масив до localstorage
      this.saveLocal('cart', this.cart);

      // Перевіряємо масив cart на пустоту
      if (this.cart == 0) {

         // Виводимо повідомлення NO RESULTS
         this.displayProductCart.innerHTML = `<h2 class="no-result">Товарів не знайдено</h2>`;
      } else {
         this.cart.forEach(({ id, title, img, price, count }, index) => {
            this.displayProductCart.insertAdjacentHTML('beforeend', `<div class="cart-added-list__item">
                                                                           <button class="cart-added-list__item-btn-delete btn-light js-btn-delete" data-index="${index}"><svg class='icon icon-close'>
                                                                                 <use xlink:href='#icon-close'></use>
                                                                              </svg></button>
                                                                           <img src="img/catalog/${img}" alt="" class="cart-added-list__item-img">
                                                                           <p class="cart-added-list__item-text-hold">
                                                                              <a href="#" class="cart-added-list__item-title-link">${title}</a>
                                                                              <span class="cart-added-list__item-meta-list">
                                                                                 <span class="cart-added-list__item-meta">Ціна: ${price} USD</span>
                                                                              </span>
                                                                           </p>
                                                                           <input type="text" class="cart-added-list__item-count js-input" placeholder="0" value="${count}" id="input-count-${id}">
                                                                           <button class="cart-added-list__item-btn-plus btn-light js-count" data-type="plus" data-input="#input-count-${id}" data-index="${index}"></button>
                                                                           <button class="cart-added-list__item-btn-minus btn-light js-count" data-type="minus" data-input="#input-count-${id}" data-index="${index}"></button>
                                                                        </div>`)
         })
      }
   }


   // Слідкую за натиском по корзинці в картці товару
   this.onPressCartBtn = (e) => {
      e.preventDefault();

      // Поточний елемент по якому був клік
      let el = e.target;

      // Перевіряємо чи елемент по якому ми клікнули є use
      if (el.nodeName == 'use')
         el = el.parentNode.parentNode;

      // Перевіряємо чи елемент по якому ми клікнули є svg
      if (el.nodeName == 'svg')
         el = el.parentNode;

      // Перевіряєо чи клік був по потрібно нам елементі
      if (el.classList.contains('js-icon-cart')) {

         // Додаємо обраний товар в масив та виводимо його в корзинку
         this.addNewProduct(el);
      }
   }

   // Функція видалення товару з корзини
   this.removeProductFromCart = (item) => {

      // Отримуємо id товару, який треба видалити
      this.idToDelete = item.dataset.index;

      // Видаляємо товар з масива cart
      this.cart.splice(this.idToDelete, 1);

      // Виводимо товари
      this.viewCartProducts();

      // Оновлюємо число товарів в корзині
      this.setCountCartProducts();

   }


   // Функція для обробок кліків на елементі корзини
   this.handleProductCartClick = (event) => {
      // Обробник зміни кіл-ті товару
      // Поточний елемент по якому був клік
      this.el = event.target;
      // Перевіряєо чи клік був по кнопкам +- кіл-ті товару
      if (this.el.classList.contains('js-count')) {
         // Якщо так, запускаю функцію зміни кіл-ті товару
         this.onChangeProductQuantity();
      }

      // Обробник видалення товару
      // Поточний елемент по якому був клік
      let item = event.target;
      // Перевіряємо чи елемент по якому ми клікнули є use
      if (item.nodeName == 'use')
         item = item.parentNode.parentNode;

      // Перевіряємо чи елемент по якому ми клікнули є svg
      if (item.nodeName == 'svg')
         item = item.parentNode;

      // Перевіряєо чи клік був по потрібно нам елементі
      if (item.classList.contains('js-btn-delete')) {

         // Видаляю обраний товар
         this.removeProductFromCart(item);
      }

   }

   // Звертаємось до апі пошуку товарів
   this.searchFetchProducts = (inputValue) => {

      // Витягуємо товари з бази даних
      fetch(this.apiSearch + inputValue)
         .then(res => res.json())
         .then((products) => {

            // Перебираємо товари для виводу
            this.diplayProducts(products);

            // Оновлюємо кількість товарів
            this.displayCountProducts(products);

         })
   }

   // Пошук товарів при події введеня користувачем значення
   this.searchProducts = (e) => {

      // Спочатку видаляємо попередній таймаут, якщо він існує
      clearTimeout(this.idTimeout);

      this.idTimeout = setTimeout(() => {

         // Витягуємо значення з поля пошуку
         const inputValue = e.target.value;

         // Викликаємо функцію звернення до арі
         this.searchFetchProducts(inputValue);
      }, 700)
   }

   // Створюємо метод об'єкту який запускає весь функціонал 
   this.init = () => {

      // Виводимо товари при завантаженні
      this.viewPorducts();

      // Виводимо товари при завантаженні
      this.viewPorductsHot();

      // Виводимо категорії при завантаженні
      this.viewCategories();

      // Виводимо товари в корзину
      this.viewCartProducts();

      // Слідкуємо за кліком по категоріях
      if (this.category)
         this.category.onclick = this.setCategoryProducts;

      // Слідкуємо за кліком по картці продукту
      this.catalog.forEach((el) => {
         el.onclick = this.onPressCartBtn;
      })

      // Слідкую за обробниками подій
      this.displayProductCart.onclick = this.handleProductCartClick;

      // Оновлюємо кількість доданих товарів в корзину при завантаженні сторінки
      this.setCountCartProducts();

      // Ховаємо і показуємо корзину
      this.cartBtn.onclick = () => this.displayProductCart.classList.toggle('show');

      this.categoryBtn.onclick = () => this.category.classList.toggle('show');

      // Слідкуємо за полем пошуку
      if (this.inputSearch)
         this.inputSearch.oninput = this.searchProducts;
   }
}

// Ініціалізуємо об'єкт
const shopInit = new shop();

// Запускаємо перший метод в якому і буде збиратися весь функціонал
shopInit.init();

