export default class SortableTable {
  element;
  subElements = {};

  constructor(headersConfig = [], {
    data = [],
    sorted = {
      id: headersConfig.find(item => item.sortable).id,
      order: 'asc',
    }
  } = {}) {
    this.headersConfig = headersConfig;
    this.data = data;
    this.sorted = sorted;

    this.render();
    this.addEventListeners();
  }

  render () {
    const sortedData = this.sortData(this.sorted.id, this.sorted.order);

    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate(sortedData);

    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements();
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

  getTemplate(data) {
    return `
      <div class="sortable-table">
        ${this.getTableHeader()}
        ${this.getTableBody(data)}

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

  getTableBody(data) {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getTableBodyRows(data)}
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
  }

  sort = (event) => {
    const sortedNow = event.target.closest('[data-sortable]');

    if (sortedNow.dataset.sortable === 'true') {
      const order = sortedNow.dataset.order;
      const switchedOrder = (order === 'asc') ? 'desc' : 'asc';
      sortedNow.dataset.order = switchedOrder;

      const arrow = sortedNow.querySelector('.sortable-table__sort-arrow');
      if(!arrow) {
        sortedNow.append(this.subElements.arrow);
      }

      const sortedData = this.sortData(sortedNow.dataset.id, switchedOrder);
      this.subElements.body.innerHTML = this.getTableBodyRows(sortedData);
    }
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
  }
}
