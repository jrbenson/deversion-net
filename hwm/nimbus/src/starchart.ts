import createPanZoom, { PanZoom } from 'panzoom'
import { System } from './system'
import { getData } from './data'
import { newSVG } from './svg'

import mapSVG from '../map.svg'

export class StarChart {
  element: HTMLElement
  panzoom: PanZoom
  stars: Star[] = []
  staticElements: SVGElement[] = []

  constructor(element: HTMLElement) {
    this.element = element

    this.panzoom = createPanZoom(this.element, {
      minZoom: 1,
      maxZoom: 10,
      bounds: true,
      boundsPadding: 0.2,
    })

    window.fetch(mapSVG).then((res) => {
      res.text().then((text) => {
        this.element.innerHTML = text

        const svg = this.element.querySelector('svg') as SVGSVGElement
        let y = window.innerHeight / 2 - svg.clientHeight / 2
        this.panzoom.moveTo(0, y)

        getData().then((data) => {
          this.update(data)
          console.log(data)

          this.panzoom.on('zoom', (e) => {
            const zoom = Number(this.element.style.transform.split(',')[0].split('(')[1])
            for (let star of this.stars) {
              star.handleZoom(zoom)
            }
          })
        })
      })
    })
  }

  update(data: Map<string, System>) {
    for (let [name, system] of data) {
      const svg = this.element.querySelector('svg') as SVGSVGElement
      if (name === '') {
        console.log('name is empty', system)
        break
      }
      const marker = this.element.querySelector(`#${name.replace(/ /g, '_')}`) as SVGCircleElement
      if (marker) {
        this.stars.push(new Star(system, svg, marker.cx.baseVal.value, marker.cy.baseVal.value))
        marker.remove()
      }
    }
  }
}

class Star {
  data: System
  svg: SVGSVGElement
  x: number
  y: number

  staticGroup: SVGGElement | undefined = undefined

  constructor(data: System, svg: SVGSVGElement, x: number, y: number) {
    this.data = data
    this.svg = svg
    this.x = x
    this.y = y
    this.createSVG()
  }

  createSVG() {
    this.staticGroup = newSVG('g') as SVGGElement
    this.staticGroup.setAttribute('transform', `translate(${this.x} ${this.y})`)

    const text = newSVG('text')
    text.setAttribute('x', '8')
    text.setAttribute('y', '-13')
    text.setAttribute('fill', '#ffffff')
    text.textContent = this.data.name
    text.classList.add('system-label')
    this.staticGroup.appendChild(text)

    const star = newSVG('circle')
    star.setAttribute('cx', '0')
    star.setAttribute('cy', '-18')
    star.setAttribute('r', '3')
    star.setAttribute('fill', '#ffffff')
    this.staticGroup.appendChild(star)

    const newMarker = newSVG('circle')
    newMarker.setAttribute('cx', '0')
    newMarker.setAttribute('cy', '0')
    newMarker.setAttribute('r', '1.5')
    newMarker.setAttribute('fill', '#ffffff')
    this.staticGroup.appendChild(newMarker)

    const connector = newSVG('line')
    connector.setAttribute('x1', '0')
    connector.setAttribute('y1', '-18')
    connector.setAttribute('x2', '0')
    connector.setAttribute('y2', '0')
    connector.setAttribute('stroke', '#ffffff')
    connector.setAttribute('stroke-width', '0.5')
    this.staticGroup.appendChild(connector)

    this.svg.appendChild(this.staticGroup)
  }

  handleZoom(scale: number) {
    if (this.staticGroup) {
      let transform = this.staticGroup.getAttribute('transform')
      if (transform) {
        if (transform.includes('scale')) {
          transform = transform.replace(/scale(.*)/g, `scale(${1 / scale})`)
        } else {
          transform += ` scale(${1 / scale})`
        }
        this.staticGroup.setAttribute('transform', transform)
      }
    }
  }
}
