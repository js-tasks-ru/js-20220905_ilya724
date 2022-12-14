export default class NotificationMessage {
  static currentElement;
  element;
  timer;

  constructor(text = '', {duration = 0, type = ''} = {}) {
    this.text = text;
    this.duration = duration;
    this.type = type;
    
    this.render();
  }

  get template() {
    return `
      <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          <div class="notification-body">
            ${this.text}
          </div>
        </div>
      </div>
  `;
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;
  }

  show(div = document.body) {
    if (NotificationMessage.currentElement) {
      NotificationMessage.currentElement.remove();
    }

    div.append(this.element);
    this.timer = setTimeout(() => this.remove(), this.duration);

    NotificationMessage.currentElement = this;
  }

  remove() {
    this.element?.remove();
    clearTimeout(this.timer);
  }

  destroy() {
    this.remove();
    this.element = null;
    this.currentElement = null;
  }
}
