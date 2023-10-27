import { getOreLevelRangeString, getJovianBandsHTML } from './data'
import { System } from './system'
import { numberToRomanNumeral } from './utils'

export class SystemList {
  element: HTMLElement

  _events: Map<string, Function[]> = new Map()

  constructor(element: HTMLElement, data: Map<string, System>) {
    this.element = element

    let html = '<ul>'
    for (let [name, system] of data) {
      html += this.getListItemHTML(system)
    }
    html += '</ul>'
    this.element.innerHTML = html

    this.element.querySelectorAll('li .header').forEach((li) => {
      li.addEventListener('click', (e) => {
        const target = e.target as HTMLElement
        const id = target.closest('li')?.dataset.id
        if (id) {
          this.setSelected(id)
        }
      })
    })
  }

  on(event: string, callback: Function) {
    if (!this._events.has(event)) {
      this._events.set(event, [])
    }
    this._events.get(event)?.push(callback)
  }

  off(event: string, callback: Function) {
    if (this._events.has(event)) {
      const callbacks = this._events.get(event)
      if (callbacks) {
        const index = callbacks.indexOf(callback)
        if (index > -1) {
          callbacks.splice(index, 1)
        }
      }
    }
  }

  setSelected(id: string, userAction = true) {
    const li = this.element.querySelector('li.selected') as HTMLElement
    let curSelectedId = ''
    if (li) {
      li.classList.remove('selected')
      let selDetails = li.querySelector('.details') as HTMLElement
      if (selDetails) {
        selDetails.style.display = 'none'
      }
      if (li.dataset.id) {
        curSelectedId = li.dataset.id.trim()
      }
    }

    if (curSelectedId === id && userAction) {
      this._events.get('select')?.forEach((callback) => {
        callback('__deselect__')
      })
      return
    }

    if (id && id !== '__deselect__') {
      const item = this.element.querySelector(`li[data-id="${id}"]`) as HTMLElement
      if (item) {
        item.classList.add('selected')
        let selDetails = item.querySelector('.details') as HTMLElement
        if (selDetails) {
          selDetails.style.display = 'inline-block'
        }
        let prevOffset = 0
        const header = item.querySelector('.header') as HTMLElement
        if (header) {
          prevOffset = header.offsetHeight + header.offsetHeight * 0.2
        }
        this.element.scrollTo({ top: item.offsetTop - prevOffset, behavior: 'smooth' })
        //this.element.scrollTop = item.offsetTop
      }

      if (userAction) {
        this._events.get('select')?.forEach((callback) => {
          callback(id)
        })
      }
    }
  }

  getListItemHTML(system: System) {
    let html = `
      <li data-id="${system.name}">
        <div class="header">
          <span class="name">${system.name}</span>
          <span class="summary">
            <span class="tier-wrapper">
              <span class="tier">${numberToRomanNumeral(system.tier)}</span>
              <span class="level">${system.level}</span>
            </span>
          </span>
        </div>
        <div class="details">
          ${this.getAsteroidHTML(system)}
          ${this.getJovianHTML(system)}
          ${system.asteroids.length > 0 || system.jovians.length > 0 ? '<hr>' : ''}
          ${this.getSignalHTML(system)}
        </div>
      </li>
    `
    return html
  }

  getAsteroidHTML(system: System) {
    let html = ''
    if (system.asteroids.length > 0) {
      html += `<div>${getOreLevelRangeString(system.asteroids)}</div>`
    }
    return html
  }

  getSignalHTML(system: System) {
    let html = ''
    for (let signal of system.signals) {
      html += `<div class="signal">${signal.name}</div>`
    }
    return html
  }

  getJovianHTML(system: System) {
    let html = ''
    if (system.jovians.length > 0) {
      html += `<div>${getJovianBandsHTML(system.jovians, 3)}</div>`
    }
    return html
  }
}
