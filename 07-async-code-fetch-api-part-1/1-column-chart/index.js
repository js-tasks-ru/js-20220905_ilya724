import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  element;
  subElements = {};
  chartHeight = 50;

  constructor({
    url = '',
    range = {
      from: new Date(),
      to: new Date(),
    },
    label = '',
    link = '',
    formatHeading = data => data,
  } = {}) {
    this.url = new URL(url, BACKEND_URL);
    this.range = range;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;
    this.data = [];

    this.render();
    this.update(this.range.from, this.range.to);
  }

  render() {
    const columnChart = document.createElement('div');

    columnChart.className = 'column-chart column-chart_loading';

    columnChart.setAttribute('style', `--chart-height: ${this.chartHeight}`);

    columnChart.innerHTML = `
      <div class="column-chart__title">
        Total ${this.label}
        ${this.getLinkProps()}
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header"></div>
        <div data-element="body" class="column-chart__chart"></div>
      </div>
    `

    this.element = columnChart;
    this.subElements = this.getSubElements();
  }

  getLinkProps() {
    return this.link ? `<a href="${this.link}" class="column-chart__link">View all</a>` : '';
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

  getHeaderProps(data) {
    let sum = 0;
    for (const value of Object.values(data)) {
      sum += value;
    }

    return this.formatHeading(sum);
  }

  getColumnProps(data) {
    const maxValue = Math.max(...Object.values(data));
    const scale = this.chartHeight / maxValue;

    return Object.entries(data).map(([_, value]) => {
      const percent = (value / maxValue * 100).toFixed(0) + '%';
      const currentValue = String(Math.floor(value * scale));

      return `<div style="--value: ${currentValue}" data-tooltip="${percent}"></div>`;
    }).join('');
  }

  async update(from, to) {
    this.element.classList.add('column-chart_loading');

    this.range.from = from;
    this.range.to = to;
    this.url.searchParams.set('from', from.toISOString());
    this.url.searchParams.set('to', to.toISOString());

    const data = await fetchJson(this.url);

    if (Object.values(data).length) {
      this.subElements.header.textContent = this.getHeaderProps(data);
      this.subElements.body.innerHTML = this.getColumnProps(data);

      this.element.classList.remove('column-chart_loading');
    }

    this.data = data;
    return this.data;
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
