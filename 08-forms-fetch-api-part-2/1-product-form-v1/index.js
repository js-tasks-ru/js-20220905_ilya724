import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  element
  subElements = {}

  formData = {}
  categories = []

  defaultFormData = {
    title: '',
    description: '',

    price: 100,
    discount: 0,
    quantity: 1,  
    status: 1,  

    images: [],
  }

  constructor(productId = '') {
    this.productId = productId
  }

  addEventListeners() {
    this.subElements.productForm.addEventListener('submit', this.submitHandler);

    this.subElements.uploadImage.addEventListener('click', this.uploadImageHandler);

    this.subElements.imageListContainer.addEventListener('click', event => {
      if ('deleteHandle' in event.target.dataset) {
        event.target.closest('li').remove();
      }
    })
  }

  addDispatchEvent() {
    const event = this.productId
    ? new CustomEvent('product-updated')
    : new CustomEvent('product-saved')

    this.element.dispatchEvent(event);
  }
  
  submitHandler = (event) => {
    event.preventDefault();
    this.save()
  }

  async save() {
    const savedProduct = this.getFormValues();

    try {
      await fetchJson(`${BACKEND_URL}/api/rest/products`, {
        method: this.productId ? 'PATCH' : 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(savedProduct)
      })

      this.addDispatchEvent();
    } catch (error) {
      console.error('Failed to save/add', error)
    }
  }

  getFormValues() {
    const formFields = Object.keys(this.defaultFormData).filter(item => item !== 'images');
    const productImages = this.subElements.imageListContainer.querySelectorAll('.sortable-table__cell-img');
    
    const formValues = {
      id: this.productId,
      images: [],
    }

    for (const fieldName of formFields) {
      const value = this.subElements.productForm.querySelector(`[name="${fieldName}"]`);
      formValues[fieldName] = value
    }

    for (const image of productImages) {
      formValues.images.push({
        url: image.src,
        source: image.alt
      })
    }

    return formValues
  }

  uploadImageHandler = () => {
    const imageInput = document.createElement('input');
    imageInput.type = 'file';
    imageInput.accept = 'image/*';

    imageInput.addEventListener('change', async () => {
      const [file] = imageInput.files;

      if (file) {
        const form = new FormData();
        form.append('image', file);

        this.subElements.uploadImage.classList.add('is-loading');
        this.subElements.uploadImage.disabled = true;

        const result = await fetchJson('https://api.imgur.com/3/image', {
          method: 'POST',
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
          },
          body: form,
          referrer: ''
        });

        const wrapper = document.createElement('div');
        wrapper.innerHTML = this.getImage(file.name, result.data.link);
        this.subElements.imageListContainer.append(wrapper.firstElementChild);

        this.subElements.uploadImage.classList.remove('is-loading');
        this.subElements.uploadImage.disabled = false;

        imageInput.remove()
      }
    })

    imageInput.click()
  }

  async render() {
    const promiseCategories = fetchJson(`${BACKEND_URL}/api/rest/categories?_sort=weight&_refs=subcategory`);

    const promiseProductInfo = this.productId
    ? fetchJson(`${BACKEND_URL}/api/rest/products?id=${this.productId}`)
    : Promise.resolve(this.defaultFormData)

    const [categories, responseProductInfo] = await Promise.all([
      promiseCategories, promiseProductInfo
    ])

    const productInfo = this.productId ? responseProductInfo[0] : responseProductInfo

    this.formData = productInfo;
    this.categories = categories;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements();

    const formFields = Object.keys(this.defaultFormData).filter(item => item !== 'images');

    for (const fieldName of formFields) {
      const element = this.subElements.productForm.querySelector(`[name="${fieldName}"]`);
      element.value = this.formData[fieldName] ? this.formData[fieldName] : this.defaultFormData[fieldName];
    }
    
    this.addEventListeners();
    return this.element
  }

  getTemplate() {
    return `
      <div class="product-form">
      <form data-element="productForm" class="form-grid">
        <div class="form-group form-group__half_left">
          <fieldset>
            <label class="form-label">Название товара</label>
            <input required="" type="text" name="title" class="form-control" placeholder="Название товара" id="title" value="">
          </fieldset>
        </div>
        <div class="form-group form-group__wide">
          <label class="form-label">Описание</label>
          <textarea required = "" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара" id="description"></textarea>
        </div>
        <div class="form-group form-group__wide">
          <label class="form-label">Фото</label>
          <ul class="sortable-list" data-element="imageListContainer">
            ${this.getImages()}
          </ul>
          <button data-element="uploadImage" type="button" class="button-primary-outline">
            <span>Загрузить</span>
          </button>
        </div>
        <div class="form-group form-group__half_left">
          <label class="form-label">Категория</label>
            ${this.getCategories()}
        </div>
        <div class="form-group form-group__half_left form-group__two-col">
          <fieldset>
            <label class="form-label">Цена ($)</label>
            <input required="" type="number" name="price" class="form-control" id="price" value="" placeholder="${this.formData.price}">
          </fieldset>
          <fieldset>
            <label class="form-label">Скидка ($)</label>
            <input required type="number" name="discount" class="form-control" id="discount" value="" placeholder="${this.formData.discount}">
          </fieldset>
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Количество</label>
          <input required type="number" class="form-control" name="quantity" id="quantity" value="" placeholder="${this.formData.quantity}">
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Статус</label>
          <select id="status" class="form-control" name="status">
            <option value="1">Активен</option>
            <option value="0">Неактивен</option>
          </select>
        </div>
        <div class="form-buttons">
          <button type="submit" name="save" class="button-primary-outline">
            ${this.productId ? "Сохранить" : "Добавить"} товар
          </button>
        </div>
      </form>
    </div>
    `
  }

  getImages() {
    return this.formData.images.map(item => {
      return this.getImage(item.source, item.url)
    }).join('');
  }

  getImage(source, url) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <li class="products-edit__imagelist-item sortable-list__item">
        <span>
          <img src="./icon-grab.svg" data-grab-handle alt="grab">
          <img class="sortable-table__cell-img" alt="${escapeHtml(source)}" src="${escapeHtml(url)}">
          <span>${escapeHtml(source)}</span>
        </span>
        <button type="button">
          <img src="./icon-trash.svg" alt="delete" data-delete-handle>
        </button>
      </li>`
    return wrapper.innerHTML;
  }

  getCategories() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = `<select class="form-control" id="subcategory" name="subcategory"></select>`;

    const select = wrapper.firstElementChild;

    for (const category of this.categories) {
      for (const subCategory of category.subcategories) {
        select.append(new Option(`${category.title} > ${subCategory.title}`, subCategory.id));
      }
    }

    return select.outerHTML
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }

  remove () {
    this.element?.remove();
  }
  
  destroy () {
    this.remove();
    this.element = null;
    this.subElements = null;
  }
}
