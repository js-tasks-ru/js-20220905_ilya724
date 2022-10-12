import RangePicker from '../../08-forms-fetch-api-part-2/2-range-picker/index.js';
import SortableTable from '../../07-async-code-fetch-api-part-1/2-sortable-table-v3/index.js';
import ColumnChart from '../../07-async-code-fetch-api-part-1/1-column-chart/index.js';
import Tooltip from '../../06-events-practice/2-tooltip/index.js'
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  element;
  subElements = {};
  components = {};

  constructor() {
    this.url = new URL('api/dashboard/bestsellers', BACKEND_URL);
  }

  async updateComponents(from, to) {
    const loading = document.createElement('div');
    loading.className = 'progress-bar';
    loading.innerHTML = `
      <div class="progress-bar__line"></div>
    `;
    document.body.querySelector('.main').append(loading);

    const data = await this.loadComponentsData(from, to);

    this.components.ordersChart.update(from, to);
    this.components.salesChart.update(from, to);
    this.components.customersChart.update(from, to);
    this.components.sortableTable.update(data);

    loading.remove();
  }

  async loadComponentsData(from, to) {
    this.url.searchParams.set('_start', '1');
    this.url.searchParams.set('_end', '21');
    this.url.searchParams.set('_sort', 'title');
    this.url.searchParams.set('_order', 'asc');
    this.url.searchParams.set('from', from.toISOString());
    this.url.searchParams.set('to', to.toISOString());

    return await fetchJson(this.url);
  }

  getComponents() {
    const getRange = () => {
      const now = new Date();
      const to = new Date();
      const from = new Date(now.setMonth(now.getMonth() - 1));

      return { from, to };
    }

    const { from, to } = getRange();

    const rangePicker = new RangePicker({
      from,
      to
    })

    const ordersChart = new ColumnChart({
      url: 'api/dashboard/orders',
      range: {
        from,
        to,
      },
      label: 'orders',
      link: '#',
    })

    const salesChart = new ColumnChart({
      url: 'api/dashboard/sales',
      range: {
        from,
        to,
      },
      label: 'sales',
      formatHeading: data => `$${data}`,
    })

    const customersChart = new ColumnChart({
      url: 'api/dashboard/customers',
      range: {
        from,
        to,
      },
      label: 'customers',
    })

    const tooltip = new Tooltip();

    const sortableTable = new SortableTable(header, {
      url: `api/dashboard/bestsellers?_start=1&_end=20&from=${from.toISOString()}&to=${to.toISOString()}`,
      isSortLocally: true
    })

    this.components.rangePicker = rangePicker;
    this.components.ordersChart = ordersChart;
    this.components.salesChart = salesChart;
    this.components.customersChart = customersChart;
    this.components.sortableTable = sortableTable;
    this.insertComponents();

    this.components.tooltip = tooltip;
    tooltip.initialize();
  }

  insertComponents() {
    for (const component in this.components) {
      const subElement = this.subElements[component];
      const { element } = this.components[component];
      subElement.append(element);
    }
  }

  addEventListeners () {
    this.components.rangePicker.element.addEventListener('date-select', event => {
      const { from, to } = event.detail;
      this.updateComponents(from, to);
    })
  }

  render() {
    this.element = document.createElement('div');
    this.element.className = 'dashboard';
    this.element.innerHTML = this.getTemplate();

    this.subElements = this.getSubElements();

    this.getComponents();
    this.addEventListeners();

    return this.element;
  }

  getTemplate() {
    return `
      <div class="content__top-panel">
        <h2 class="page-title">Dashboard</h2>
        <div data-element="rangePicker"></div>
      </div>

      <div data-element="chartsRoot" class="dashboard__charts">
        <div data-element="ordersChart" class="dashboard__chart_orders"></div>
        <div data-element="salesChart" class="dashboard__chart_sales"></div>
        <div data-element="customersChart" class="dashboard__chart_customers"></div>
      </div>

      <h3 class="block-title">Best sellers</h3>

      <div data-element="sortableTable"></div>
    `
  }

  getSubElements () {
    const result = {};
    const elements = this.element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};

    for (const component in this.components) {
      this.components[component].destroy();
    }

    this.components = {};
  }
}
