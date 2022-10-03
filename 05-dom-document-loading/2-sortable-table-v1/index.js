export default class SortableTable {
  element;
  subElements = {};

  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;

    this.render();
  }

  render () {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;

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

  get template() {
    return `
      <div class="sortable-table">
        ${this.tableHeader}
        ${this.tableBody}

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

  get tableHeader() {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.headerConfig.map(item => this.getTableHeaderRow(item)).join('')}
      </div>
    `
  }

  getTableHeaderRow(item) {
    return `
      <div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}">
        <span>${item.title}</span>
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>
      </div>
    `
  }

  get tableBody() {
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
    return this.headerConfig.map(({ id, template }) => {
      return template
        ? template(item[id])
        : `<div class="sortable-table__cell">${item[id]}</div>`
    }).join('');
  }

  sort(field, order) {
    const sortedData = this.sortData(field, order);
    const sortableColumn = this.element.querySelector(`.sortable-table__cell[data-id="${field}"]`);
    const columns = this.element.querySelectorAll('.sortable-table__cell[data-id]');

    for (const column of columns) {
      column.dataset.order = '';
    }
    sortableColumn.dataset.order = order;

    this.subElements.body.innerHTML = this.getTableBodyRows(sortedData);
  }

  sortData(field, order) {
    if (order !== 'asc' && order !== 'desc') {
      console.error('sort type is incorrect');
      return;
    }

    const newData = [...this.data];
    const { sortType } = this.headerConfig.find(item => item.id === field);

    let sortProp = 1;
    if (order === 'desc') sortProp = -1;

    return newData.sort((a, b) => {
      if (sortType === 'number')
        return sortProp * (a[field] - b[field]);
      if (sortType === 'string')
        return sortProp * a[field].localeCompare(b[field], ['ru', 'en']);
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

