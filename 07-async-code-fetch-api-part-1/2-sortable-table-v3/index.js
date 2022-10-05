import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element;
  subElements = {};

  constructor(headersConfig = [], {
    url = '',
    isSortLocally = false,
    sorted = {
      id: headersConfig.find(item => item.sortable).id,
      order: 'asc',
    }
  } = {}) {
    this.headersConfig = headersConfig;

    this.url = new URL(url, BACKEND_URL);
    this.isSortLocally = isSortLocally;
    this.sorted = sorted;
    
    this.step = 20;
    this.start = 1;
    this.end = this.start + this.step;
    
    this.data = [];
    this.loadingData = false;

    this.render();
    this.addEventListeners();

    this.controller = new AbortController();
    this.controllerSignal = this.controller.signal;
  }

  async loadData() {
    this.url.searchParams.set('_sort', this.sorted.id);
    this.url.searchParams.set('_order', this.sorted.order);
    this.url.searchParams.set('_start', this.start);
    this.url.searchParams.set('_end', this.end);

    this.element.classList.add('sortable-table_loading');
    const data = await fetchJson(this.url);
    this.element.classList.remove('sortable-table_loading');

    return data;
  }

  async render () {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();

    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements();

    const data = await this.loadData();

    this.addedDataRows(data);
  }

  addedDataRows(data) {
    if (data.length) {
      this.data = data;
      this.subElements.body.innerHTML = this.getTableBodyRows(data);
      this.element.classList.remove('sortable-table_empty');
    } else {
      this.element.classList.add('sortable-table_empty');
    }
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

  getTemplate() {
    return `
      <div class="sortable-table sortable-table_loading">
        ${this.getTableHeader()}
        ${this.getTableBody()}

        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>

        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
          <div>
            <p>No products satisfies your filter criteria</p>
            <button type="button" class="button-primary-outline">Reset all filters</button>
          </div>
        </div>
      </div>
    `
  }

  getTableHeader() {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.headersConfig.map(item => this.getTableHeaderRow(item)).join('')}
      </div>
    `
  }

  getTableHeaderRow(item) {
    const order = this.sorted.id === item.id ? this.sorted.order : 'asc';
    const dataOrder = item.sortable ? `data-order="${order}"` : '';

    return `
      <div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}" ${dataOrder}">
        <span>${item.title}</span>
        ${this.sorted.id === item.id
          ? `<span data-element="arrow" class="sortable-table__sort-arrow">
               <span class="sort-arrow"></span>
             </span>`
          : ''
        }
      </div>
    `
  }

  getTableBody() {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getTableBodyRows(this.data)}
      </div>
    `
  }

  getTableBodyRows(data = []) {
    return data.map(item => {
      return `
        <a href="/products/${item.id}" class="sortable-table__row">
          ${this.getTableBodyRow(item)}
        </a>
      `
    }).join('');
  }

  getTableBodyRow(item) {
    return this.headersConfig.map(({ id, template }) => {
      return template
        ? template(item[id])
        : `<div class="sortable-table__cell">${item[id]}</div>`
    }).join('');
  }

  addEventListeners() {
    const columns = this.subElements.header;
    columns.addEventListener('pointerdown', this.sort);
    window.addEventListener('scroll', this.onScroll, {signal: this.controllerSignal});
  }

  onScroll = async () => {
    const { bottom } = this.element.getBoundingClientRect();

    if (bottom < document.documentElement.clientHeight && !this.loadingData && !this.isSortLocally) {
      this.start = this.end;
      this.end = this.start + this.step;

      this.loadingData = true;

      const data = await this.loadData();
      
      this.data = [...this.data, ...data];
      const newDataRows = document.createElement('div');
      newDataRows.innerHTML = this.getTableBodyRows(data);
      this.subElements.body.append(...newDataRows.childNodes);

      this.loadingData = false;
    }
  }

  sort = event => {
    const sortedNow = event.target.closest('[data-sortable]');

    if (sortedNow.dataset.sortable === 'true') {
      const order = sortedNow.dataset.order;
      const id = sortedNow.dataset.id;
      const switchedOrder = (order === 'asc') ? 'desc' : 'asc';
      this.sorted.id = id;
      this.sorted.order = switchedOrder;

      sortedNow.dataset.order = switchedOrder;

      const arrow = sortedNow.querySelector('.sortable-table__sort-arrow');
      if(!arrow) {
        sortedNow.append(this.subElements.arrow);
      }

      if (this.isSortLocally) {
        this.sortOnClient();
      } else {
        this.sortOnServer();
      }
    }
  }

  sortOnClient() {
    const sortedData = this.sortData(this.sorted.id, this.sorted.order);
    this.subElements.body.innerHTML = this.getTableBodyRows(sortedData);
  }

  async sortOnServer() {
    this.start = 1;
    this.end = this.start + this.step;
    const data = await this.loadData();

    this.addedDataRows(data);
  }

  sortData(field, order) {
    if (order !== 'asc' && order !== 'desc') {
      console.error('sort type is incorrect');
      return;
    }

    const newData = [...this.data];
    const { sortType } = this.headersConfig.find(item => item.id === field);

    let sortProp = 1;
    if (order === 'desc') sortProp = -1;

    return newData.sort((a, b) => {
      if (sortType === 'number')
        return sortProp * (a[field] - b[field]);
      if (sortType === 'string')
        return sortProp * a[field].localeCompare(b[field], ['ru', 'en']);
      throw new Error('Unknown sort type');
    });
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
    this.controller.abort();
  }
}
