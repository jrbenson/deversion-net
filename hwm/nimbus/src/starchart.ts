import createPanZoom, { PanZoom } from 'panzoom'
import { System } from './system'
import { getData, getJovianBandsString, getOresInAsteroids } from './data'
import { newSVG } from './svg'

import { numberToRomanNumeral } from './utils'

import mapSVG from '../map.svg'
import iconJovian from '../ico-jovian.svg'
import iconMining from '../ico-mining.svg'
import iconStation from '../ico-station.svg'

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
          for (let star of this.stars) {
            star.handleZoom(this.panzoom.getTransform().scale)
          }
          this.panzoom.on('transform', (e) => {
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
    this.stars
      .sort((a, b) => {
        return a.y - b.y
      })
      .forEach((star) => {
        star.addSVG()
      })
  }
}

class Star {
  data: System
  svg: SVGSVGElement
  x: number
  y: number

  svgMainGroup = newSVG('g') as SVGGElement

  containerElem: HTMLDivElement | null = null
  nameElem: HTMLSpanElement | null = null
  detailsElem: HTMLSpanElement | null = null

  constructor(data: System, svg: SVGSVGElement, x: number, y: number) {
    this.data = data
    this.svg = svg
    this.x = x
    this.y = y
    this.createSVG()
  }

  createSVG() {
    const CONNECT_OFFSET = { x: 0, y: -32 }
    const PADDING = 4
    const STAR_RADIUS = 5
    const BASE_FONT_SIZE = 20
    const BOX_SIZE = BASE_FONT_SIZE + 1

    this.svgMainGroup.setAttribute('transform', `translate(${this.x} ${this.y})`)

    const star = newSVG('circle')
    star.setAttribute('cx', `${CONNECT_OFFSET.x}`)
    star.setAttribute('cy', `${CONNECT_OFFSET.y}`)
    star.setAttribute('r', `${STAR_RADIUS}`)
    star.setAttribute('fill', '#ffffff')
    star.classList.add('map-system-star')
    this.svgMainGroup.appendChild(star)

    const newMarker = newSVG('circle')
    newMarker.setAttribute('cx', '0')
    newMarker.setAttribute('cy', '0')
    newMarker.setAttribute('r', `${STAR_RADIUS / 2}`)
    newMarker.setAttribute('fill', '#ffffff55')
    this.svgMainGroup.appendChild(newMarker)

    const connector = newSVG('line')
    connector.setAttribute('x1', `${CONNECT_OFFSET.x}`)
    connector.setAttribute('y1', `${CONNECT_OFFSET.y}`)
    connector.setAttribute('x2', '0')
    connector.setAttribute('y2', `${-STAR_RADIUS / 2}`)
    connector.setAttribute('stroke', '#ffffff')
    connector.setAttribute('stroke-width', '0.5')
    this.svgMainGroup.appendChild(connector)

    let html = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject')
    html.setAttribute('x', `${STAR_RADIUS + PADDING}`)
    html.setAttribute('y', `${CONNECT_OFFSET.y}`)
    html.setAttribute('height', '1')
    html.setAttribute('width', '100%')
    html.style.overflow = 'visible'

    this.containerElem = document.createElement('div')
    this.containerElem.classList.add('map-system-container')

    const header = document.createElement('span')
    header.classList.add('map-system-row')

    const tierWrapper = document.createElement('span')
    tierWrapper.classList.add('map-system-tier-wrapper')

    const tier = document.createElement('span')
    tier.classList.add('map-system-tier')
    tier.innerHTML = numberToRomanNumeral(this.data.tier)

    const level = document.createElement('span')
    level.classList.add('map-system-level')
    level.innerHTML = String(this.data.level)

    this.nameElem = document.createElement('span')
    this.nameElem.classList.add('map-system-name')
    this.nameElem.innerHTML = this.data.name

    this.containerElem.appendChild(header)
    header.appendChild(tierWrapper)
    tierWrapper.appendChild(tier)
    tierWrapper.appendChild(level)
    header.appendChild(this.nameElem)

    this.detailsElem = document.createElement('span')
    this.detailsElem.classList.add('map-system-row', 'map-system-detail-row')

    if (this.data.station) {
      const station = document.createElement('span')
      station.classList.add('map-system-detail')
      const stationIcon = document.createElement('img')
      stationIcon.src = iconStation
      stationIcon.classList.add('map-system-icon')
      station.appendChild(stationIcon)
      this.detailsElem.appendChild(station)
    }

    if (this.data.asteroids.length > 0) {
      const mining = document.createElement('span')
      mining.classList.add('map-system-detail')
      const miningIcon = document.createElement('img')
      miningIcon.src = iconMining
      miningIcon.classList.add('map-system-icon')
      const miningDetails = document.createElement('span')
      miningDetails.innerHTML = `${getOresInAsteroids(this.data.asteroids).join('')}`
      mining.appendChild(miningIcon)
      mining.appendChild(miningDetails)
      this.detailsElem.appendChild(mining)
    }

    if (this.data.jovians.length > 0) {
      const jovian = document.createElement('span')
      jovian.classList.add('map-system-detail')
      const jovianIcon = document.createElement('img')
      jovianIcon.src = iconJovian
      jovianIcon.classList.add('map-system-icon')
      const jovianDetails = document.createElement('span')
      jovianDetails.innerHTML = getJovianBandsString(this.data.jovians)
      jovian.appendChild(jovianIcon)
      jovian.appendChild(jovianDetails)
      this.detailsElem.appendChild(jovian)
    }

    this.containerElem.appendChild(this.detailsElem)

    html.appendChild(this.containerElem)

    if (this.nameElem) {
      this.nameElem.addEventListener('click', () => {
        console.log(this.data.name)
      })
    }

    this.svgMainGroup.appendChild(html)
  }

  addSVG() {
    this.svg.appendChild(this.svgMainGroup)
  }

  handleZoom(scale: number) {
    if (scale > 2) {
      if (this.nameElem) {
        this.nameElem.style.opacity = '1'
      }
      if (this.detailsElem) {
        this.detailsElem.style.opacity = '1'
      }
      if (this.containerElem) {
        this.containerElem.style.marginLeft = '0'
      }
    } else {
      if (this.nameElem) {
        this.nameElem.style.opacity = '0'
      }
      if (this.detailsElem) {
        this.detailsElem.style.opacity = '0'
      }
      if (this.containerElem) {
        this.containerElem.style.marginLeft = '-1.5rem'
      }
    }
    if (this.svgMainGroup) {
      let transform = this.svgMainGroup.getAttribute('transform')
      if (transform) {
        if (transform.includes('scale')) {
          transform = transform.replace(/scale(.*)/g, `scale(${1 / scale})`)
        } else {
          transform += ` scale(${1 / scale})`
        }
        console.log(transform)
        this.svgMainGroup.setAttribute('transform', transform)
      }
    }
  }
}
