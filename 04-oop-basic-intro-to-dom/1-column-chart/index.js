export default class ColumnChart {
  element;
  elementColumns;
  chartHeight = 50;

  constructor({
    data = [],
    label = '',
    value = 0,
    link = '',
    formatHeading = data => data,
  } = {}) {
    this.data = data;
    this.label = label;
    this.value = formatHeading(value);
    this.link = link;
    this.render();
  }

  getColumnProps(data) {
    
    const maxValue = Math.max(...data);
    const scale = this.chartHeight / maxValue;
  
    return data.map(item => {
      const percent = (item / maxValue * 100).toFixed(0) + '%';
      const value = String(Math.floor(item * scale));
      
      return `<div style="--value: ${value}" data-tooltip="${percent}"></div>`;
    }).join('');
  }

  getLinkProps() {
    return this.link ? `<a href="${this.link}" class="column-chart__link">View all</a>` : '';
  }

  render() {
    const columnChart = document.createElement('div');

    if (!this.data.length) {
      columnChart.className = 'column-chart column-chart_loading';
    } else {
      columnChart.className = 'column-chart';
    }

    columnChart.setAttribute('style', `--chart-height: ${this.chartHeight}`);

    columnChart.innerHTML = `
      <div class="column-chart__title">
        Total ${this.label}
        ${this.getLinkProps()}
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">${this.value}</div>
        <div data-element="body" class="column-chart__chart">
          ${this.getColumnProps(this.data)}
        </div>
      </div>
    `

    this.element = columnChart;
    this.elementColumns = this.element.querySelector('.column-chart__chart');
  }

  update(data = []) {
    this.data = data;
    this.elementColumns.innerHTML = this.getColumnProps(this.data);
    if (!this.data.length) this.element.className = 'column-chart column-chart_loading';
  }

  remove() {
    this.element.remove();
    this.elementColumns.remove();
  }

  destroy() {
    this.remove();
  }
}
